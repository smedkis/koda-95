-- Obveščanje turned out to need a real contacts list, not just a view over
-- prijave: the built admin UI already supports pasting in leads who have
-- never registered, and tracking whether a contact is currently enrolled,
-- was previously enrolled, or never has been — none of which a per-
-- registration view can represent. voznik_id links a contact to a real
-- driver profile once they've actually registered (so enrollment status can
-- be computed from that driver's prijave history); it's null for
-- manually-pasted leads with no registration yet. Email is unique so a
-- driver who registers after being manually added updates the same row
-- instead of creating a duplicate.

create table narocniki (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text not null unique,
  phone text,
  source text,
  voznik_id uuid references vozniki (id) on delete set null,
  last_notified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table narocniki enable row level security;
