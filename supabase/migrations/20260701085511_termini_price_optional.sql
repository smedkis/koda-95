-- Redna Koda 95 has a fixed price (50 EUR, defaulted in the admin form).
-- Začetna Koda 95 has no fixed price yet, so price must be settable later
-- rather than required at termin creation.

alter table termini alter column price_eur drop not null;
