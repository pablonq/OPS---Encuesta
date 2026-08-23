-- Esquema para el sistema de Encuestas de Capacitación (OPS)
-- Ejecutar en el SQL Editor de Supabase.

create extension if not exists "pgcrypto";

create table if not exists capacitaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  carga_horaria numeric,
  observacion text,
  creada_en timestamptz not null default now()
);

create table if not exists instructores (
  id uuid primary key default gen_random_uuid(),
  nombre_apellido text not null,
  observaciones text,
  creado_en timestamptz not null default now()
);

create table if not exists respuestas (
  id uuid primary key default gen_random_uuid(),
  capacitacion_id uuid not null references capacitaciones(id) on delete cascade,
  instructor_id uuid not null references instructores(id) on delete cascade,
  dominio_tema smallint not null check (dominio_tema between 1 and 5),
  claridad_conceptos smallint not null check (claridad_conceptos between 1 and 5),
  respeto_horarios smallint not null check (respeto_horarios between 1 and 5),
  calidad_material smallint not null check (calidad_material between 1 and 5),
  aplicabilidad smallint not null check (aplicabilidad between 1 and 5),
  observaciones text,
  creada_en timestamptz not null default now()
);

create index if not exists respuestas_capacitacion_idx on respuestas (capacitacion_id);
create index if not exists respuestas_instructor_idx on respuestas (instructor_id);

-- RLS habilitado sin policies: el acceso público (anon key) queda bloqueado
-- por completo. La app solo accede a estas tablas desde las API routes del
-- servidor usando la service role key, que ignora RLS.
alter table capacitaciones enable row level security;
alter table instructores enable row level security;
alter table respuestas enable row level security;
