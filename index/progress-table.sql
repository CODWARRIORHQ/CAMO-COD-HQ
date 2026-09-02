create table if not exists public.camo_progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    progress jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.camo_progress enable row level security;

grant select, insert, update on public.camo_progress to authenticated;

drop policy if exists "Users can read their own progress" on public.camo_progress;
create policy "Users can read their own progress"
on public.camo_progress for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own progress" on public.camo_progress;
create policy "Users can insert their own progress"
on public.camo_progress for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own progress" on public.camo_progress;
create policy "Users can update their own progress"
on public.camo_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop table if exists public.progress_history cascade;
