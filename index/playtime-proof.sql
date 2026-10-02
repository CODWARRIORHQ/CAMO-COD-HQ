create table if not exists public.playtime_submissions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    game_key text not null check (game_key in (
        'MW2007', 'MW2', 'BOI', 'MW3', 'BOII', 'GHOSTS', 'ADVANCED',
        'BOIII', 'INFINITE', 'MWREMASTERED', 'WWII', 'BOIIII', 'CODM',
        'MW2019', 'WARZONE', 'MW2REMASTERED', 'COLDWAR', 'VANGUARD',
        'MWII', 'MWIII', 'BO6', 'BO7', 'MW4'
    )),
    platform text not null check (platform in ('Steam', 'Xbox', 'Battle.net', 'PlayStation')),
    device text not null check (device in ('PC', 'Xbox', 'PlayStation')),
    hours numeric(10, 2) not null check (hours >= 0 and hours <= 200000),
    screenshot_path text not null unique
        check (split_part(screenshot_path, '/', 1) = user_id::text),
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    review_note text,
    reviewed_by uuid references auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists playtime_submissions_user_created_idx
    on public.playtime_submissions (user_id, created_at desc);
create index if not exists playtime_submissions_pending_idx
    on public.playtime_submissions (created_at)
    where status = 'pending';
create unique index if not exists playtime_submissions_one_pending_source_idx
    on public.playtime_submissions (user_id, game_key, platform, device)
    where status = 'pending';

create table if not exists public.playtime_public_totals (
    user_id uuid not null references auth.users(id) on delete cascade,
    game_key text not null,
    platform text not null,
    device text not null,
    hours numeric(10, 2) not null check (hours >= 0 and hours <= 200000),
    verified_at timestamptz not null,
    primary key (user_id, game_key, platform, device)
);

alter table public.playtime_submissions enable row level security;
alter table public.playtime_public_totals enable row level security;

revoke all on public.playtime_submissions from anon, authenticated;
grant select on public.playtime_submissions to authenticated;
grant insert (user_id, game_key, platform, device, hours, screenshot_path)
    on public.playtime_submissions to authenticated;
grant update (status, review_note, reviewed_by, reviewed_at)
    on public.playtime_submissions to authenticated;

drop policy if exists "Users can submit their own playtime proofs" on public.playtime_submissions;
create policy "Users can submit their own playtime proofs"
on public.playtime_submissions for insert
to authenticated
with check (
    auth.uid() = user_id
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
);

drop policy if exists "Users can read their own playtime submissions" on public.playtime_submissions;
create policy "Users can read their own playtime submissions"
on public.playtime_submissions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can read playtime submissions" on public.playtime_submissions;
create policy "Admins can read playtime submissions"
on public.playtime_submissions for select
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.user_id = auth.uid()
          and profiles.is_admin = true
    )
);

drop policy if exists "Admins can review pending playtime submissions" on public.playtime_submissions;
create policy "Admins can review pending playtime submissions"
on public.playtime_submissions for update
to authenticated
using (
    status = 'pending'
    and exists (
        select 1 from public.profiles
        where profiles.user_id = auth.uid()
          and profiles.is_admin = true
    )
)
with check (
    status in ('approved', 'rejected')
    and reviewed_by = auth.uid()
    and reviewed_at is not null
    and exists (
        select 1 from public.profiles
        where profiles.user_id = auth.uid()
          and profiles.is_admin = true
    )
);

revoke all on public.playtime_public_totals from anon, authenticated;
grant select on public.playtime_public_totals to anon, authenticated;

drop policy if exists "Public can read verified playtime on public profiles" on public.playtime_public_totals;
create policy "Public can read verified playtime on public profiles"
on public.playtime_public_totals for select
to anon, authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.user_id = playtime_public_totals.user_id
          and (profiles.is_public = true or profiles.user_id = auth.uid())
    )
);

create or replace function public.publish_approved_playtime_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.status = 'approved' and old.status is distinct from new.status then
        insert into public.playtime_public_totals (
            user_id, game_key, platform, device, hours, verified_at
        )
        values (
            new.user_id, new.game_key, new.platform, new.device, new.hours, new.created_at
        )
        on conflict (user_id, game_key, platform, device)
        do update set
            hours = excluded.hours,
            verified_at = excluded.verified_at
        where excluded.verified_at >= playtime_public_totals.verified_at;
    end if;
    return new;
end;
$$;

revoke all on function public.publish_approved_playtime_submission() from public, anon, authenticated;
drop trigger if exists publish_approved_playtime_submission on public.playtime_submissions;
create trigger publish_approved_playtime_submission
after update of status on public.playtime_submissions
for each row
execute function public.publish_approved_playtime_submission();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'playtime-proofs',
    'playtime-proofs',
    false,
    104857600,
    array['image/jpeg', 'image/png']
)
on conflict (id) do update set
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own playtime proofs" on storage.objects;
create policy "Users can upload their own playtime proofs"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'playtime-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Owners and admins can read playtime proofs" on storage.objects;
create policy "Owners and admins can read playtime proofs"
on storage.objects for select
to authenticated
using (
    bucket_id = 'playtime-proofs'
    and (
        (storage.foldername(name))[1] = auth.uid()::text
        or exists (
            select 1 from public.profiles
            where profiles.user_id = auth.uid()
              and profiles.is_admin = true
        )
    )
);

drop policy if exists "Owners can remove their orphaned playtime proofs" on storage.objects;
create policy "Owners can remove their orphaned playtime proofs"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'playtime-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
);
