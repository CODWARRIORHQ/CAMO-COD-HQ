create or replace function public.get_registration_stats()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
    select jsonb_build_object(
        'total',
        (select count(*)::bigint from auth.users where coalesce(is_anonymous, false) = false),
        'months',
        coalesce(
            (
                select jsonb_agg(
                    jsonb_build_object(
                        'month', to_char(month_start, 'YYYY-MM'),
                        'count', user_count
                    )
                    order by month_start
                )
                from (
                    select
                        date_trunc('month', created_at)::date as month_start,
                        count(*)::bigint as user_count
                    from auth.users
                    where created_at >= date_trunc('month', now()) - interval '11 months'
                      and coalesce(is_anonymous, false) = false
                    group by 1
                ) as registrations
            ),
            '[]'::jsonb
        )
    );
$function$;

revoke all on function public.get_registration_stats() from public;
grant execute on function public.get_registration_stats() to anon, authenticated;
