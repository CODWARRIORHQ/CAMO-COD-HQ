create or replace view public.leaderboard_stats as
select
    profiles.user_id,
    profiles.username,
    coalesce(sum(jsonb_array_length(progress_item.value)), 0)::integer as completed
from public.profiles
left join public.camo_progress on camo_progress.user_id = profiles.user_id
left join lateral jsonb_each(camo_progress.progress) as progress_item on true
group by profiles.user_id, profiles.username;

grant select on public.leaderboard_stats to anon, authenticated;
