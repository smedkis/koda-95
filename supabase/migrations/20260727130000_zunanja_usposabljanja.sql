-- Some drivers completed one or more Koda 95 lectures/exams through a
-- different training provider before switching to Tahografi Cuderman.
-- Those sessions were never run by us, so they can't become a real `termini`
-- row (that table represents sessions we actually host) or a `prijave` row
-- (which requires a real termin_id). This table records the historical fact
-- on the driver's profile instead: which program/module they completed, and
-- when, at another provider.

create table zunanja_usposabljanja (
  id uuid primary key default gen_random_uuid(),
  voznik_id uuid not null references vozniki(id) on delete cascade,
  program program_key not null,
  modul integer check (modul is null or (modul >= 2000 and modul <= 2100)),
  date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index zunanja_usposabljanja_voznik_id_idx on zunanja_usposabljanja (voznik_id);

alter table zunanja_usposabljanja enable row level security;
