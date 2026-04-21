-- Extend profiles
alter table public.profiles add column if not exists level text not null default 'Arriving';
alter table public.profiles add column if not exists current_streak_days int not null default 0;
alter table public.profiles add column if not exists longest_streak_days int not null default 0;
alter table public.profiles add column if not exists last_active_date date;
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists onboarding_goal text;

-- Backfill referral codes
update public.profiles set referral_code = lower(substr(md5(random()::text || user_id::text), 1, 8)) where referral_code is null;

-- USER ACTIONS (event log — source of truth)
create table public.user_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  action_type text not null,
  -- e.g. video_watched, video_started, prompt_copied, prompt_applied,
  --      challenge_done, win_posted, event_attended, reply_posted,
  --      toolkit_done, referral_signup
  track_id uuid references public.tracks(id) on delete set null,
  ref_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.user_actions enable row level security;
create policy "users view own actions" on public.user_actions for select using (auth.uid() = user_id);
create policy "users insert own actions" on public.user_actions for insert with check (auth.uid() = user_id);
create index user_actions_user_idx on public.user_actions (user_id, created_at desc);
create index user_actions_user_type_idx on public.user_actions (user_id, action_type);

-- USER BADGES
create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  badge_code text not null,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_code)
);
alter table public.user_badges enable row level security;
create policy "users view own badges" on public.user_badges for select using (auth.uid() = user_id);
-- inserts happen only via security-definer trigger

-- TRACK LEVELS (per user per track)
create table public.track_levels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  track_id uuid not null references public.tracks(id) on delete cascade,
  stage text not null default 'Starter', -- Starter / Building / Practising / Mastery
  updated_at timestamptz not null default now(),
  unique (user_id, track_id)
);
alter table public.track_levels enable row level security;
create policy "users view own track levels" on public.track_levels for select using (auth.uid() = user_id);
create policy "users upsert own track levels" on public.track_levels for insert with check (auth.uid() = user_id);
create policy "users update own track levels" on public.track_levels for update using (auth.uid() = user_id);

-- REFERRALS
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_user_id uuid not null,
  invitee_user_id uuid not null unique,
  code text not null,
  created_at timestamptz not null default now()
);
alter table public.referrals enable row level security;
create policy "users view own referrals" on public.referrals for select using (auth.uid() = inviter_user_id or auth.uid() = invitee_user_id);
-- inserts via security-definer function only

-- Auto-issue referral code on new profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, display_name, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    lower(substr(md5(random()::text || new.id::text), 1, 8))
  );
  insert into public.user_roles (user_id, role) values (new.id, 'member');
  return new;
end;
$$;

-- AWARD BADGE helper
create or replace function public.award_badge(_user uuid, _code text)
returns void language sql security definer set search_path = public as $$
  insert into public.user_badges (user_id, badge_code) values (_user, _code) on conflict do nothing;
$$;

-- Trigger: after each action insert, evaluate badges + update streak
create or replace function public.on_user_action()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  cnt int;
  applied_count int;
  challenge_count int;
  reply_count int;
  toolkit_count int;
  event_count int;
  win_count int;
  today date := (new.created_at at time zone 'utc')::date;
  last date;
  cur int;
  long int;
begin
  -- Badge: First Apply
  if new.action_type = 'prompt_applied' then
    select count(*) into applied_count from public.user_actions where user_id = new.user_id and action_type = 'prompt_applied';
    if applied_count = 1 then perform public.award_badge(new.user_id, 'first_apply'); end if;
  end if;

  -- Badge: First Win Posted
  if new.action_type = 'win_posted' then
    select count(*) into win_count from public.user_actions where user_id = new.user_id and action_type = 'win_posted';
    if win_count = 1 then perform public.award_badge(new.user_id, 'first_win_posted'); end if;
  end if;

  -- Badge: Challenge Finisher (3+)
  if new.action_type = 'challenge_done' then
    select count(*) into challenge_count from public.user_actions where user_id = new.user_id and action_type = 'challenge_done';
    if challenge_count >= 3 then perform public.award_badge(new.user_id, 'challenge_finisher'); end if;
  end if;

  -- Badge: Helpful Voice (5 replies)
  if new.action_type = 'reply_posted' then
    select count(*) into reply_count from public.user_actions where user_id = new.user_id and action_type = 'reply_posted';
    if reply_count >= 5 then perform public.award_badge(new.user_id, 'helpful_voice'); end if;
  end if;

  -- Badge: Toolkit Done
  if new.action_type = 'toolkit_done' then
    select count(*) into toolkit_count from public.user_actions where user_id = new.user_id and action_type = 'toolkit_done';
    if toolkit_count = 1 then perform public.award_badge(new.user_id, 'toolkit_done'); end if;
  end if;

  -- Badge: Event Joiner
  if new.action_type = 'event_attended' then
    select count(*) into event_count from public.user_actions where user_id = new.user_id and action_type = 'event_attended';
    if event_count = 1 then perform public.award_badge(new.user_id, 'event_joiner'); end if;
  end if;

  -- Update streak (gentle): increment if today and yesterday consecutive, else reset to 1
  select last_active_date, current_streak_days, longest_streak_days
    into last, cur, long from public.profiles where user_id = new.user_id for update;

  if last is null or last < today - interval '1 day' then
    -- Allow 1-day grace (skipped a day) without resetting if within same week
    if last is not null and last = today - interval '2 day' then
      cur := cur + 1; -- grace day
    else
      cur := 1;
    end if;
  elsif last = today - interval '1 day' then
    cur := cur + 1;
  end if;
  if cur > long then long := cur; end if;

  update public.profiles
     set current_streak_days = cur,
         longest_streak_days = long,
         last_active_date = today,
         streak_days = cur,
         xp = xp + case new.action_type
           when 'video_watched' then 5
           when 'prompt_applied' then 10
           when 'prompt_copied' then 2
           when 'challenge_done' then 25
           when 'win_posted' then 30
           when 'event_attended' then 15
           when 'reply_posted' then 5
           when 'toolkit_done' then 20
           else 1 end
   where user_id = new.user_id;

  -- Badge: 7-Day Consistency
  if cur >= 7 then perform public.award_badge(new.user_id, 'consistency_7'); end if;
  if cur >= 30 then perform public.award_badge(new.user_id, 'consistency_30'); end if;

  return new;
end;
$$;
create trigger user_actions_after_insert after insert on public.user_actions for each row execute function public.on_user_action();

-- Track completion: 15 video / 20 prompts / 20 challenges / 20 toolkits / 15 templates / 10 playlists
create or replace function public.track_completion(_user uuid, _track uuid)
returns int language plpgsql stable security definer set search_path = public as $$
declare
  total_videos int; done_videos int;
  total_prompts int; done_prompts int;
  total_challenges int; done_challenges int;
  total_tools int; done_tools int;
  total_templates int; touched_templates int;
  total_playlists int; touched_playlists int;
  pct numeric := 0;
begin
  select count(*) into total_videos from public.videos where track_id = _track and published;
  select count(distinct ref_id) into done_videos from public.user_actions
    where user_id = _user and track_id = _track and action_type = 'video_watched';
  select count(*) into total_prompts from public.prompts where track_id = _track;
  select count(distinct ref_id) into done_prompts from public.user_actions
    where user_id = _user and track_id = _track and action_type = 'prompt_applied';
  select count(*) into total_challenges from public.challenges where track_id = _track;
  select count(distinct ref_id) into done_challenges from public.user_actions
    where user_id = _user and track_id = _track and action_type = 'challenge_done';
  select count(*) into total_tools from public.tools where track_id = _track;
  select count(distinct ref_id) into done_tools from public.user_actions
    where user_id = _user and track_id = _track and action_type = 'toolkit_done';
  select count(*) into total_templates from public.templates where track_id = _track;
  select count(distinct ref_id) into touched_templates from public.user_actions
    where user_id = _user and track_id = _track and action_type in ('template_used','prompt_copied');
  select count(*) into total_playlists from public.playlists where track_id = _track;
  select count(distinct ref_id) into touched_playlists from public.user_actions
    where user_id = _user and track_id = _track and action_type = 'playlist_opened';

  if total_videos > 0 then pct := pct + 15.0 * done_videos / total_videos; end if;
  if total_prompts > 0 then pct := pct + 20.0 * done_prompts / total_prompts; end if;
  if total_challenges > 0 then pct := pct + 20.0 * done_challenges / total_challenges; end if;
  if total_tools > 0 then pct := pct + 20.0 * done_tools / total_tools; end if;
  if total_templates > 0 then pct := pct + 15.0 * touched_templates / total_templates; end if;
  if total_playlists > 0 then pct := pct + 10.0 * touched_playlists / total_playlists; end if;

  return least(100, round(pct))::int;
end;
$$;

-- Week momentum: counts for the rolling 7-day window
create or replace function public.week_momentum(_user uuid)
returns table(lessons int, prompts int, challenges int, wins int)
language sql stable security definer set search_path = public as $$
  select
    coalesce(sum(case when action_type = 'video_watched' then 1 else 0 end),0)::int,
    coalesce(sum(case when action_type = 'prompt_applied' then 1 else 0 end),0)::int,
    coalesce(sum(case when action_type = 'challenge_done' then 1 else 0 end),0)::int,
    coalesce(sum(case when action_type = 'win_posted' then 1 else 0 end),0)::int
  from public.user_actions
  where user_id = _user and created_at >= now() - interval '7 days'
$$;