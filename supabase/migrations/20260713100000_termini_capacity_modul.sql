-- Two gaps found while wiring the admin termini UI to real data:
--
-- 1. Redna Koda 95 termini carry a "modul" (module year, e.g. "Modul 2026")
--    that is independent of the session's calendar date (35h spread over 5
--    years) — the UI already collects and displays this, but no column
--    existed to store it. Zacetna termini have no modul concept.
-- 2. Zacetna Koda 95 termini have no capacity limit (the admin form never
--    collects one, and the card shows "Neomejeno prostih mest"), so
--    capacity can't be NOT NULL for every termin — same shape of fix as
--    the earlier price_eur nullability migration.

alter table termini add column modul integer check (modul is null or (modul >= 2000 and modul <= 2100));
alter table termini alter column capacity drop not null;
