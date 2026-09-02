create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique,
    accent_color text not null default '#06b6d4',
    is_public boolean not null default true,
    icon_url text,
    avatar_url text,
    calling_card_url text,
    updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists accent_color text not null default '#06b6d4';
alter table public.profiles add column if not exists is_public boolean not null default true;
alter table public.profiles add column if not exists icon_url text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists calling_card_url text;

alter table public.profiles enable row level security;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

drop policy if exists "Public can read usernames" on public.profiles;
create policy "Public can read public profiles"
on public.profiles for select
to anon, authenticated
using (is_public or auth.uid() = user_id);

drop policy if exists "Users can create their profile" on public.profiles;
create policy "Users can create their profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
