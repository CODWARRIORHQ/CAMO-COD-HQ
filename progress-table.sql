create table if not exists public.camo_progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    progress jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.camo_progress enable row level security;

create policy "Users can read their own progress"
on public.camo_progress for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own progress"
on public.camo_progress for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own progress"
on public.camo_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
