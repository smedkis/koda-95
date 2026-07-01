-- Koda 95 initial schema: termini (training sessions), vozniki (drivers),
-- prijave (registrations). Obveščanje is a view over prijave, not a table,
-- since it's a log/list rather than an independent data source.
--
-- All admin access goes through the service role key server-side (there is
-- no Supabase Auth / users table — admin login checks a single username and
-- password from environment variables). RLS is enabled on every table with
-- no policies, so the anon/public API key has no direct access at all;
-- every read and write is mediated by server-side code.

create extension if not exists pgcrypto;

create type program_key as enum ('redna-koda-95', 'zacetna-koda-95');
create type residence_type as enum ('permanent', 'temporary');
create type licence_category as enum ('C', 'D');
create type payer_type as enum ('self', 'company');
create type payment_status as enum ('pending', 'paid');

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- termini --------------------------------------------------------------

create table termini (
  id uuid primary key default gen_random_uuid(),
  program program_key not null,
  date date not null,
  capacity integer not null check (capacity > 0),
  price_eur numeric(10, 2) not null check (price_eur >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program, date)
);

alter table termini enable row level security;

create trigger termini_set_updated_at
  before update on termini
  for each row
  execute function set_updated_at();

-- vozniki (drivers) ------------------------------------------------------
-- One profile per person, matched by EMŠO across registrations so a
-- returning driver (e.g. renewing Redna Koda 95 every 5 years) reuses the
-- same profile instead of creating a duplicate.

create table vozniki (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  date_of_birth date,
  place_of_birth text,
  country_of_birth text,
  emso text,
  citizenship text,
  residence_type residence_type,
  postal_code text,
  city text,
  street_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index vozniki_emso_key on vozniki (emso) where emso is not null;

alter table vozniki enable row level security;

create trigger vozniki_set_updated_at
  before update on vozniki
  for each row
  execute function set_updated_at();

-- prijave (registrations) -------------------------------------------------

create sequence registration_code_seq start 1000;

create or replace function generate_registration_code()
returns text
language sql
as $$
  select 'TC-' || nextval('registration_code_seq')::text;
$$;

create table prijave (
  id uuid primary key default gen_random_uuid(),
  registration_code text not null unique default generate_registration_code(),
  termin_id uuid not null references termini (id) on delete restrict,
  voznik_id uuid not null references vozniki (id) on delete restrict,
  licence_categories licence_category[] not null
    check (array_length(licence_categories, 1) > 0),
  payer_type payer_type not null default 'self',
  company_name text,
  company_tax_number text,
  consent_marketing boolean not null default false,
  consent_terms boolean not null,
  payment_status payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (termin_id, voznik_id),
  check (
    (payer_type = 'company' and company_name is not null and company_tax_number is not null)
    or (payer_type = 'self')
  )
);

create index prijave_termin_id_idx on prijave (termin_id);
create index prijave_voznik_id_idx on prijave (voznik_id);

alter table prijave enable row level security;

create trigger prijave_set_updated_at
  before update on prijave
  for each row
  execute function set_updated_at();

-- obveščanje ---------------------------------------------------------------
-- Log of everyone registered with their source (program, and company name
-- when the registration was paid by a company).

create view obvescanje as
select
  p.id,
  p.registration_code,
  v.full_name,
  v.email,
  v.phone,
  t.program,
  t.date as termin_date,
  p.payer_type,
  p.company_name,
  p.payment_status,
  p.consent_marketing,
  p.created_at
from prijave p
join termini t on t.id = p.termin_id
join vozniki v on v.id = p.voznik_id;
