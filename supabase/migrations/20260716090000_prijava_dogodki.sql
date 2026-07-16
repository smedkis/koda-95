-- Tracks events on a registration (currently just termin moves) so the
-- driver edit page's Zgodovina section can show real, persisted history
-- instead of only the client-side placeholder log — needed because moving a
-- driver navigates to a different page entirely, so anything not persisted
-- would be lost immediately.

create table prijava_dogodki (
  id uuid primary key default gen_random_uuid(),
  prijava_id uuid not null references prijave (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index prijava_dogodki_prijava_id_idx on prijava_dogodki (prijava_id);

alter table prijava_dogodki enable row level security;
