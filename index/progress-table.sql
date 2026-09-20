create table if not exists public.camo_progress (
    user_id uuid references auth.users(id) on delete cascade,
    game text not null default 'Modern Warfare 2019',
    progress jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    primary key (user_id, game)
);

-- Migration for installations created with the original user-only key.
alter table public.camo_progress
    add column if not exists game text;

update public.camo_progress
set game = 'Modern Warfare 2019'
where game is null;

alter table public.camo_progress
    alter column game set default 'Modern Warfare 2019',
    alter column game set not null;

alter table public.camo_progress
    drop constraint if exists camo_progress_pkey;

alter table public.camo_progress
    add constraint camo_progress_pkey primary key (user_id, game);

create table if not exists public.camo_catalog (
    game text not null,
    weapon text not null,
    camo_count integer not null check (camo_count > 0),
    primary key (game, weapon)
);

insert into public.camo_catalog (game, weapon, camo_count)
values
    ('Modern Warfare 2019', 'M4A1', 104),
    ('Modern Warfare 2019', 'Comando', 104),
    ('Modern Warfare 2019', 'RAM-7', 104),
    ('Modern Warfare 2019', 'Grau 5.56', 104),
    ('Modern Warfare 2019', 'M13', 104),
    ('Modern Warfare 2019', 'FR 5,56', 104),
    ('Modern Warfare 2019', 'CR-56 AMAX', 104),
    ('Modern Warfare 2019', 'ODEN', 104),
    ('Modern Warfare 2019', 'KILO 141', 104),
    ('Modern Warfare 2019', 'FAL', 104),
    ('Modern Warfare 2019', 'FN SCAR 17', 104),
    ('Modern Warfare 2019', 'AK-47', 104),
    ('Modern Warfare 2019', 'AN-94', 104),
    ('Modern Warfare 2019', 'AS VAL', 104),
    ('Modern Warfare 2019', 'MP5', 104),
    ('Modern Warfare 2019', 'MP7', 104),
    ('Modern Warfare 2019', 'AUG', 104),
    ('Modern Warfare 2019', 'P90', 104),
    ('Modern Warfare 2019', 'PP19 Bizon', 104),
    ('Modern Warfare 2019', 'UZI', 104),
    ('Modern Warfare 2019', 'STRIKER 45', 104),
    ('Modern Warfare 2019', 'FENNEC', 104),
    ('Modern Warfare 2019', 'ISO', 104),
    ('Modern Warfare 2019', 'CX-9', 104),
    ('Modern Warfare 2019', 'MODELO 680', 104),
    ('Modern Warfare 2019', '725', 104),
    ('Modern Warfare 2019', 'ESCOPETA R9-0', 104),
    ('Modern Warfare 2019', 'ESCOPETA ORIGIN 12', 104),
    ('Modern Warfare 2019', 'ROGUE VLK', 104),
    ('Modern Warfare 2019', 'JAK-12', 104),
    ('Modern Warfare 2019', 'PKM', 104),
    ('Modern Warfare 2019', 'SA87', 104),
    ('Modern Warfare 2019', 'KAR98K', 104),
    ('Modern Warfare 2019', 'M91', 104),
    ('Modern Warfare 2019', 'MG34', 104),
    ('Modern Warfare 2019', 'HOLGER-26', 104),
    ('Modern Warfare 2019', 'M19', 104),
    ('Modern Warfare 2019', 'BRUEN MK9', 104),
    ('Modern Warfare 2019', 'RENETTI', 104),
    ('Modern Warfare 2019', 'AMETRALLADORA LEGERA FINN', 104),
    ('Modern Warfare 2019', 'RAAL', 104),
    ('Modern Warfare 2019', 'CARABINA MK2', 104),
    ('Modern Warfare 2019', 'BALLESTA', 104),
    ('Modern Warfare 2019', 'SKS', 104),
    ('Modern Warfare 2019', 'SP-R 208', 104),
    ('Modern Warfare 2019', 'DRAGUNOV', 104),
    ('Modern Warfare 2019', 'HDR', 104),
    ('Modern Warfare 2019', 'AX-50', 104),
    ('Modern Warfare 2019', 'RYTEC AMR', 104),
    ('Modern Warfare 2019', 'X16', 104),
    ('Modern Warfare 2019', '1911', 104),
    ('Modern Warfare 2019', '.357', 104),
    ('Modern Warfare 2019', '.50 GS', 104),
    ('Modern Warfare 2019', 'SYKOV', 104),
    ('Modern Warfare 2019', 'PILA', 104),
    ('Modern Warfare 2019', 'JOKR', 104),
    ('Modern Warfare 2019', 'RPG-7', 104),
    ('Modern Warfare 2019', 'ESCUDO ANTIDISTURBIOS', 104),
    ('Modern Warfare 2019', 'CUCHILLO', 104),
    ('Modern Warfare 2019', 'PALOS DE KALI', 104),
    ('Modern Warfare 2019', 'KODACHIS DUALES', 104),
    ('Modern Warfare 2019', 'EBR-14', 104)
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
        where game = new.game
          and weapon = progress_item.key;

        if catalog_count is null then
            raise exception 'Arma no autorizada en el progreso de %: %', new.game, progress_item.key;
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
