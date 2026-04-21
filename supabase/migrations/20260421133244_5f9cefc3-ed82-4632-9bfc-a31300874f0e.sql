
-- Scout agent
insert into public.agents (name, role, tagline, category, model, system_prompt)
select 'Scout','Research & Discovery Agent',
  'Your research sidekick. Ask Scout to dig up references, summarize a topic, find tools, or scan a webpage you paste in.',
  'support','google/gemini-2.5-flash',
  'You are Scout, a friendly research assistant inside the AI For Real Life platform. Help members find information, summarize topics, compare options, and surface useful tools or articles. When the user pastes a URL or text, analyze it. When asked for sources, be transparent that you can only reason from training data unless the user pastes content. Always reply in a warm, plain-spoken voice. Format responses in markdown with short paragraphs and bullet lists. End every reply with one tiny next-step suggestion.'
where not exists (select 1 from public.agents where name = 'Scout');

-- Daily AI usage helper
create or replace function public.ai_messages_today(_user uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.agent_messages
  where user_id = _user and role = 'user' and created_at >= now() - interval '24 hours'
$$;

-- Drop any old analytics fns to avoid signature conflicts
drop function if exists public.analytics_signups(int);
drop function if exists public.analytics_ai_usage(int);
drop function if exists public.analytics_top_saves(int);
drop function if exists public.analytics_retention();

create function public.analytics_signups(_days int default 30)
returns table(day date, signups int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not has_role(auth.uid(), 'admin') then raise exception 'admin only'; end if;
  return query select date_trunc('day', created_at)::date, count(*)::int
    from public.profiles where created_at >= now() - (_days || ' days')::interval
    group by 1 order by 1;
end $$;

create function public.analytics_ai_usage(_days int default 30)
returns table(agent_id uuid, agent_name text, messages int, conversations int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not has_role(auth.uid(), 'admin') then raise exception 'admin only'; end if;
  return query
    select a.id, a.name, count(m.*)::int, count(distinct c.id)::int
    from public.agents a
    left join public.agent_conversations c on c.agent_id = a.id and c.created_at >= now() - (_days || ' days')::interval
    left join public.agent_messages m on m.conversation_id = c.id and m.role = 'assistant'
    group by a.id, a.name order by 3 desc;
end $$;

create function public.analytics_top_saves(_limit int default 10)
returns table(item_type text, item_id uuid, saves int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not has_role(auth.uid(), 'admin') then raise exception 'admin only'; end if;
  return query
    select s.item_type, s.item_id, count(*)::int
    from public.saved_items s group by 1,2 order by 3 desc limit _limit;
end $$;

create function public.analytics_retention()
returns table(bucket text, users int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not has_role(auth.uid(), 'admin') then raise exception 'admin only'; end if;
  return query
    select 'active_7d', count(distinct user_id)::int from public.user_actions where created_at >= now() - interval '7 days'
    union all select 'active_30d', count(distinct user_id)::int from public.user_actions where created_at >= now() - interval '30 days'
    union all select 'active_90d', count(distinct user_id)::int from public.user_actions where created_at >= now() - interval '90 days';
end $$;
