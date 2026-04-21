
-- ============ CATALOGUE TABLES ============

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  number text not null,
  title text not null,
  tagline text not null,
  description text not null,
  agent_name text not null,
  agent_role text not null,
  hue text not null check (hue in ('pink','yellow','lavender','blush')),
  tier public.membership_tier not null default 'try',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text not null,
  category text not null check (category in ('writing','numbers','search')),
  tagline text not null,
  system_prompt text not null,
  model text not null default 'google/gemini-2.5-flash',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.track_agents (
  track_id uuid not null references public.tracks(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  is_primary boolean not null default false,
  primary key (track_id, agent_id)
);

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  body text not null,
  use_case text not null,
  difficulty text not null default 'starter' check (difficulty in ('starter','intermediate','power')),
  sort_order int not null default 0,
  agent_id uuid references public.agents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  description text,
  youtube_id text,
  duration_minutes int not null default 0,
  questions_answered text[] not null default '{}',
  tags text[] not null default '{}',
  presentation_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  name text not null,
  description text not null,
  use_case text,
  url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  body text not null,
  use_case text not null,
  problem_solved text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  creator text,
  youtube_url text not null,
  duration_minutes int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  title text not null,
  description text not null,
  kind text not null default 'quick' check (kind in ('quick','five_day')),
  success_metric text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============ MEMBER TABLES ============

create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_type text not null check (item_type in ('prompt','video','tool','template','conversation')),
  item_id uuid not null,
  track_id uuid references public.tracks(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

create table public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  agent_id uuid not null references public.agents(id) on delete cascade,
  track_id uuid references public.tracks(id) on delete set null,
  title text not null default 'New conversation',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.agent_conversations(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============ INDEXES ============

create index idx_prompts_track on public.prompts(track_id);
create index idx_videos_track on public.videos(track_id);
create index idx_tools_track on public.tools(track_id);
create index idx_templates_track on public.templates(track_id);
create index idx_playlists_track on public.playlists(track_id);
create index idx_challenges_track on public.challenges(track_id);
create index idx_saved_items_user on public.saved_items(user_id);
create index idx_conversations_user on public.agent_conversations(user_id);
create index idx_messages_conv on public.agent_messages(conversation_id);

-- ============ TRIGGERS ============

create trigger trg_tracks_updated before update on public.tracks
  for each row execute function public.update_updated_at_column();
create trigger trg_agents_updated before update on public.agents
  for each row execute function public.update_updated_at_column();
create trigger trg_prompts_updated before update on public.prompts
  for each row execute function public.update_updated_at_column();
create trigger trg_videos_updated before update on public.videos
  for each row execute function public.update_updated_at_column();
create trigger trg_tools_updated before update on public.tools
  for each row execute function public.update_updated_at_column();
create trigger trg_templates_updated before update on public.templates
  for each row execute function public.update_updated_at_column();
create trigger trg_conversations_updated before update on public.agent_conversations
  for each row execute function public.update_updated_at_column();

-- ============ RLS ============

alter table public.tracks enable row level security;
alter table public.agents enable row level security;
alter table public.track_agents enable row level security;
alter table public.prompts enable row level security;
alter table public.videos enable row level security;
alter table public.tools enable row level security;
alter table public.templates enable row level security;
alter table public.playlists enable row level security;
alter table public.challenges enable row level security;
alter table public.saved_items enable row level security;
alter table public.agent_conversations enable row level security;
alter table public.agent_messages enable row level security;

-- Public read for catalogue
create policy "anyone reads tracks" on public.tracks for select using (true);
create policy "anyone reads agents" on public.agents for select using (true);
create policy "anyone reads track_agents" on public.track_agents for select using (true);
create policy "anyone reads prompts" on public.prompts for select using (true);
create policy "anyone reads videos" on public.videos for select using (true);
create policy "anyone reads tools" on public.tools for select using (true);
create policy "anyone reads templates" on public.templates for select using (true);
create policy "anyone reads playlists" on public.playlists for select using (true);
create policy "anyone reads challenges" on public.challenges for select using (true);

-- Admins write catalogue
create policy "admins write tracks" on public.tracks for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins write agents" on public.agents for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins write track_agents" on public.track_agents for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins write prompts" on public.prompts for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins write videos" on public.videos for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins write tools" on public.tools for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins write templates" on public.templates for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins write playlists" on public.playlists for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins write challenges" on public.challenges for all using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Members own their saves + chats
create policy "users view own saves" on public.saved_items for select using (auth.uid() = user_id);
create policy "users insert own saves" on public.saved_items for insert with check (auth.uid() = user_id);
create policy "users delete own saves" on public.saved_items for delete using (auth.uid() = user_id);
create policy "users update own saves" on public.saved_items for update using (auth.uid() = user_id);

create policy "users view own conversations" on public.agent_conversations for select using (auth.uid() = user_id);
create policy "users insert own conversations" on public.agent_conversations for insert with check (auth.uid() = user_id);
create policy "users update own conversations" on public.agent_conversations for update using (auth.uid() = user_id);
create policy "users delete own conversations" on public.agent_conversations for delete using (auth.uid() = user_id);

create policy "users view own messages" on public.agent_messages for select using (auth.uid() = user_id);
create policy "users insert own messages" on public.agent_messages for insert with check (auth.uid() = user_id);
create policy "users delete own messages" on public.agent_messages for delete using (auth.uid() = user_id);
