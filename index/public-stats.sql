drop view if exists public.leaderboard_stats;

alter table public.profiles add column if not exists is_public boolean not null default true;
alter table public.profiles add column if not exists favorite_game text not null default 'Modern Warfare 2019';
alter table public.profiles add column if not exists selected_medals jsonb not null default '["completion"]'::jsonb;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists game_progress jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists medal_earned_at jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists previous_rank integer;

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
    coalesce(sum(jsonb_array_length(progress_item.value)), 0)::integer as completed
from public.profiles
left join public.camo_progress on camo_progress.user_id = profiles.user_id
left join lateral jsonb_each(camo_progress.progress) as progress_item on true
group by profiles.user_id, profiles.username, profiles.accent_color, profiles.is_public, profiles.favorite_game, profiles.selected_medals, profiles.game_progress, profiles.medal_earned_at, profiles.previous_rank, profiles.created_at, profiles.icon_url
having profiles.is_public or profiles.user_id = auth.uid();

grant select on public.leaderboard_stats to anon, authenticated;
