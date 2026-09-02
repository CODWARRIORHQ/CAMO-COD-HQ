drop view if exists public.leaderboard_stats;

create view public.leaderboard_stats as
select
    profiles.user_id,
    profiles.username,
    profiles.accent_color,
    profiles.is_public,
    profiles.icon_url,
    coalesce(sum(jsonb_array_length(progress_item.value)), 0)::integer as completed
from public.profiles
left join public.camo_progress on camo_progress.user_id = profiles.user_id
left join lateral jsonb_each(camo_progress.progress) as progress_item on true
group by profiles.user_id, profiles.username, profiles.accent_color, profiles.is_public, profiles.icon_url
having profiles.is_public or profiles.user_id = auth.uid();

grant select on public.leaderboard_stats to anon, authenticated;
