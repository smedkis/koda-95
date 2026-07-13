-- Začetna Koda 95 termini have no fixed location or time either (agreed
-- individually, like price and capacity already are) — same shape of fix
-- as the earlier price_eur/capacity nullability migrations.

alter table termini alter column address drop not null;
alter table termini alter column start_time drop not null;
alter table termini alter column end_time drop not null;
