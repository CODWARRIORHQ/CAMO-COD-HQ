create table if not exists public.codm_progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    progress jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

alter table public.codm_progress enable row level security;
grant select, insert, update on public.codm_progress to authenticated;

drop policy if exists "Users can read their own CODM progress" on public.codm_progress;
create policy "Users can read their own CODM progress"
on public.codm_progress for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own CODM progress" on public.codm_progress;
create policy "Users can insert their own CODM progress"
on public.codm_progress for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own CODM progress" on public.codm_progress;
create policy "Users can update their own CODM progress"
on public.codm_progress for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
