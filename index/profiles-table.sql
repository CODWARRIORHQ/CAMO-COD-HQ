create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    username text not null unique,
    accent_color text not null default '#06b6d4',
    is_public boolean not null default true,
    favorite_game text not null default 'Modern Warfare 2019',
    selected_medals jsonb not null default '["completion"]'::jsonb,
    bio text not null default '',
    platform text not null default 'PC',
    country text not null default '',
    level integer not null default 1,
    status text not null default 'En progreso',
    game_progress jsonb not null default '{}'::jsonb,
    medal_earned_at jsonb not null default '{}'::jsonb,
    previous_rank integer,
    created_at timestamptz not null default now(),
    icon_url text,
    avatar_url text,
    calling_card_url text,
    updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists accent_color text not null default '#06b6d4';
alter table public.profiles add column if not exists is_public boolean not null default true;
alter table public.profiles add column if not exists favorite_game text not null default 'Modern Warfare 2019';
alter table public.profiles add column if not exists selected_medals jsonb not null default '["completion"]'::jsonb;
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists platform text not null default 'PC';
alter table public.profiles add column if not exists country text not null default '';
alter table public.profiles add column if not exists level integer not null default 1;
alter table public.profiles add column if not exists status text not null default 'En progreso';
alter table public.profiles add column if not exists game_progress jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists medal_earned_at jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists previous_rank integer;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists icon_url text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists calling_card_url text;

alter table public.profiles enable row level security;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

drop policy if exists "Public can read usernames" on public.profiles;
drop policy if exists "Public can read public profiles" on public.profiles;
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
