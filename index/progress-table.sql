create table if not exists public.camo_progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    progress jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

create table if not exists public.camo_catalog (
    game text not null,
    weapon text not null,
    camo_count integer not null check (camo_count > 0),
    primary key (game, weapon)
);

insert into public.camo_catalog (game, weapon, camo_count)
values
    ('Modern Warfare 2019', 'AK-47', 104),
    ('Modern Warfare 2019', 'Comando', 104),
    ('Modern Warfare 2019', 'Fal', 104),
    ('Modern Warfare 2019', 'Scar-H', 104),
    ('Modern Warfare 2019', 'STG-44', 104),
    ('Modern Warfare 2019', 'AUG HBAR', 104),
    ('Modern Warfare 2019', 'RAM-7', 104),
    ('Modern Warfare 2019', 'M13', 104),
    ('Modern Warfare 2019', 'ACR Vengeance', 104),
    ('Modern Warfare 2019', 'PPSH-41', 104),
    ('Modern Warfare 2019', 'UMP45', 104),
    ('Modern Warfare 2019', 'Vector', 104),
    ('Modern Warfare 2019', 'MP-7', 104),
    ('Modern Warfare 2019', 'MP5 Suppressed', 104),
    ('Modern Warfare 2019', 'MP-40', 104),
    ('Modern Warfare 2019', 'Thompson M1A1', 104),
    ('Modern Warfare 2019', 'Kar98k', 104),
    ('Modern Warfare 2019', 'Barrett .50cal', 104),
    ('Modern Warfare 2019', 'Intervention', 104),
    ('Modern Warfare 2019', 'Desert Eagle', 104),
    ('Modern Warfare 2019', 'M19', 104),
    ('Modern Warfare 2019', '44 Magnum', 104),
    ('Modern Warfare 2019', 'M93 Raffica', 104),
    ('Modern Warfare 2019', 'melee', 104)
on conflict (game, weapon) do update set camo_count = excluded.camo_count;

create or replace function public.validate_camo_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    progress_item record;
    catalog_count integer;
    index_value text;
begin
    if jsonb_typeof(new.progress) <> 'object' then
        raise exception 'El progreso debe ser un objeto JSON válido';
    end if;

    for progress_item in select key, value from jsonb_each(new.progress) loop
        select camo_count into catalog_count
        from public.camo_catalog
        where game = 'Modern Warfare 2019'
          and weapon = progress_item.key;

        if catalog_count is null then
            raise exception 'Arma no autorizada en el progreso: %', progress_item.key;
        end if;

        if jsonb_typeof(progress_item.value) <> 'array' then
            raise exception 'El progreso de % debe ser una lista', progress_item.key;
        end if;

        if jsonb_array_length(progress_item.value) > catalog_count then
            raise exception 'Demasiados camuflajes para el arma: %', progress_item.key;
        end if;

        if (select count(*) from jsonb_array_elements_text(progress_item.value) item(value)
            where value !~ '^[0-9]+$') > 0 then
            raise exception 'Índice de camuflaje inválido para: %', progress_item.key;
        end if;

        for index_value in select value from jsonb_array_elements_text(progress_item.value) item(value) loop
            if index_value::integer < 0 or index_value::integer >= catalog_count then
                raise exception 'Índice de camuflaje fuera de rango para: %', progress_item.key;
            end if;
        end loop;

        if (select count(*) from jsonb_array_elements_text(progress_item.value))
            <> (select count(distinct value) from jsonb_array_elements_text(progress_item.value) item(value)) then
            raise exception 'Hay índices de camuflaje repetidos para: %', progress_item.key;
        end if;
    end loop;

    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists validate_camo_progress_trigger on public.camo_progress;
create trigger validate_camo_progress_trigger
before insert or update on public.camo_progress
for each row execute function public.validate_camo_progress();

alter table public.camo_progress enable row level security;

grant select, insert, update on public.camo_progress to authenticated;
revoke insert, update, delete on public.camo_catalog from anon, authenticated;

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
