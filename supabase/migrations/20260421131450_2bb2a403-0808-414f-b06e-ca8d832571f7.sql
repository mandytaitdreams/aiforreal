-- EVENTS
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  speaker_name text,
  speaker_bio text,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  timezone text not null default 'UTC',
  platform text,
  join_url text,
  replay_url text,
  cover_url text,
  track_tags text[] not null default '{}',
  published boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
create policy "anyone reads published events" on public.events for select using (published = true or has_role(auth.uid(),'admin'));
create policy "admins write events" on public.events for all using (has_role(auth.uid(),'admin')) with check (has_role(auth.uid(),'admin'));
create trigger events_updated before update on public.events for each row execute function public.update_updated_at_column();
create index events_starts_at_idx on public.events (starts_at desc);

-- RSVPs
create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);
alter table public.event_rsvps enable row level security;
create policy "users view own rsvps" on public.event_rsvps for select using (auth.uid() = user_id or has_role(auth.uid(),'admin'));
create policy "users insert own rsvps" on public.event_rsvps for insert with check (auth.uid() = user_id);
create policy "users delete own rsvps" on public.event_rsvps for delete using (auth.uid() = user_id);

-- FORUM POSTS
create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  section text not null check (section in ('questions','wins','resources','feedback')),
  title text not null,
  body text not null,
  track_id uuid references public.tracks(id) on delete set null,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.forum_posts enable row level security;
create policy "anyone reads posts" on public.forum_posts for select using (true);
create policy "users insert own posts" on public.forum_posts for insert with check (auth.uid() = user_id);
create policy "users update own posts" on public.forum_posts for update using (auth.uid() = user_id or has_role(auth.uid(),'admin'));
create policy "users delete own posts" on public.forum_posts for delete using (auth.uid() = user_id or has_role(auth.uid(),'admin'));
create trigger forum_posts_updated before update on public.forum_posts for each row execute function public.update_updated_at_column();
create index forum_posts_section_idx on public.forum_posts (section, created_at desc);
create index forum_posts_track_idx on public.forum_posts (track_id);

-- REPLIES
create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.forum_replies enable row level security;
create policy "anyone reads replies" on public.forum_replies for select using (true);
create policy "users insert own replies" on public.forum_replies for insert with check (auth.uid() = user_id);
create policy "users update own replies" on public.forum_replies for update using (auth.uid() = user_id or has_role(auth.uid(),'admin'));
create policy "users delete own replies" on public.forum_replies for delete using (auth.uid() = user_id or has_role(auth.uid(),'admin'));
create index forum_replies_post_idx on public.forum_replies (post_id, created_at);

-- REACTIONS
create table public.forum_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null,
  emoji text not null default '👍',
  created_at timestamptz not null default now(),
  unique (post_id, user_id, emoji)
);
alter table public.forum_reactions enable row level security;
create policy "anyone reads reactions" on public.forum_reactions for select using (true);
create policy "users insert own reactions" on public.forum_reactions for insert with check (auth.uid() = user_id);
create policy "users delete own reactions" on public.forum_reactions for delete using (auth.uid() = user_id);

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "users view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "users delete own notifications" on public.notifications for delete using (auth.uid() = user_id);
create policy "system inserts notifications" on public.notifications for insert with check (true);
create index notifications_user_idx on public.notifications (user_id, read, created_at desc);

-- Trigger: notify post author when someone replies
create or replace function public.notify_on_reply()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  author uuid;
  post_title text;
begin
  select user_id, title into author, post_title from public.forum_posts where id = new.post_id;
  if author is not null and author <> new.user_id then
    insert into public.notifications (user_id, kind, title, body, link)
    values (author, 'reply', 'New reply on your post', post_title, '/community?post=' || new.post_id);
  end if;
  return new;
end $$;
create trigger forum_reply_notify after insert on public.forum_replies for each row execute function public.notify_on_reply();

-- Trigger: notify on featured win
create or replace function public.notify_on_feature()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.featured = true and (old.featured is distinct from true) then
    insert into public.notifications (user_id, kind, title, body, link)
    values (new.user_id, 'featured', 'Your win was featured!', new.title, '/community?post=' || new.id);
  end if;
  return new;
end $$;
create trigger forum_feature_notify after update on public.forum_posts for each row execute function public.notify_on_feature();

-- Trigger: notify all members of new published event
create or replace function public.notify_on_new_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.published then
    insert into public.notifications (user_id, kind, title, body, link)
    select user_id, 'event', 'New event: ' || new.title, to_char(new.starts_at, 'Mon DD, HH24:MI'), '/events'
    from public.profiles;
  end if;
  return new;
end $$;
create trigger events_notify after insert on public.events for each row execute function public.notify_on_new_event();