-- Tracks whether the driver explicitly said "I don't have an EMŠO number"
-- on the /obrazec form (some countries don't issue one) — without this, a
-- blank emso column is indistinguishable in admin from the field simply
-- never having been filled in.
alter table vozniki add column no_emso boolean not null default false;
