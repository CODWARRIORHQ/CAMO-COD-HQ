-- Ejecutar una vez en el SQL Editor de Supabase del proyecto.
-- Requiere la tabla public.camo_catalog existente.
-- Añade/corrige entradas del catálogo; no modifica el progreso de usuarios,
-- no elimina tablas y no cambia permisos ni políticas RLS.
begin;

--1. MODERN WARFARE 2019--
insert into public.camo_catalog (game, weapon, camo_count)
values
    ('Modern Warfare 2019', 'KILO 141', 104),
    ('Modern Warfare 2019', 'AUG', 104),
    ('Modern Warfare 2019', 'MODELO 680', 104),
    ('Modern Warfare 2019', 'PKM', 104),
    ('Modern Warfare 2019', 'EBR-14', 104),
    ('Modern Warfare 2019', 'DRAGUNOV', 104),
    ('Modern Warfare 2019', 'X16', 104),
    ('Modern Warfare 2019', 'PILA', 104),
    ('Modern Warfare 2019', 'ESCUDO ANTIDISTURBIOS', 104)
on conflict (game, weapon) do update set camo_count =excluded.camo_count;


commit;
