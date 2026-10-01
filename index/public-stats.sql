drop view if exists public.leaderboard_stats;

alter table public.profiles add column if not exists is_public boolean not null default true;
alter table public.profiles add column if not exists favorite_game text not null default 'Modern Warfare 2019';
alter table public.profiles add column if not exists selected_medals jsonb not null default '["completion"]'::jsonb;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists game_progress jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists medal_earned_at jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists previous_rank integer;

create or replace function public.count_profile_camos(progress jsonb)
returns bigint
language plpgsql
immutable
as $$
declare
    entry record;
    total bigint := 0;
begin
    case jsonb_typeof(progress)
        when 'number' then
            return greatest(0, trunc((progress #>> '{}')::numeric))::bigint;
        when 'string' then
            if (progress #>> '{}') ~ '^[0-9]+$' then
                return (progress #>> '{}')::bigint;
            end if;
            return 0;
        when 'array' then
            return jsonb_array_length(progress);
        when 'object' then
            for entry in select key, value from jsonb_each(progress) loop
                if entry.key not in ('__totals', '__mastery') then
                    total := total + public.count_profile_camos(entry.value);
                end if;
            end loop;
            return total;
        else
            return 0;
    end case;
end;
$$;

create view public.leaderboard_stats as
select
    profiles.user_id,
    profiles.username,
    profiles.accent_color,
    profiles.is_public,
    profiles.favorite_game,
    profiles.selected_medals,
    profiles.game_progress,
    profiles.medal_earned_at,
    profiles.previous_rank,
    profiles.created_at,
    profiles.icon_url,
    coalesce(public.count_profile_camos(profiles.game_progress), 0)::integer as completed
from public.profiles
where profiles.is_public or profiles.user_id = auth.uid();

grant execute on function public.count_profile_camos(jsonb) to anon, authenticated;
grant select on public.leaderboard_stats to anon, authenticated;
