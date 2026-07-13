-- Two more gaps found while wiring termini + registrations to real data:
--
-- 1. termini had no columns for location or start/end time, even though the
--    admin form already collects both and every card/detail page displays
--    them.
-- 2. prijave required licence_categories (non-empty) and consent_terms on
--    every row, but the existing "Dodaj voznik" admin flow creates a
--    registration from just contact info and expects the driver to finish
--    the rest later (its copy literally says so) — so a prijava must be
--    able to exist before those fields are known. "Form completed" becomes
--    derived: licence_categories present and consent_terms not null.
--    Also adding company_email, used by the payment step's company-contact
--    field but missing from the original schema.

-- termini has no rows yet, so these can be added NOT NULL directly.
alter table termini add column address text not null;
alter table termini add column start_time time not null;
alter table termini add column end_time time not null;

alter table prijave alter column consent_terms drop not null;
alter table prijave alter column licence_categories drop not null;
alter table prijave drop constraint prijave_licence_categories_check;
alter table prijave add constraint prijave_licence_categories_check
  check (licence_categories is null or array_length(licence_categories, 1) > 0);
alter table prijave add column company_email text;
