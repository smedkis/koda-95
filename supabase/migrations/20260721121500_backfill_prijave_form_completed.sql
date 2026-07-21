-- One-time backfill: prijave completed via completeRegistration before the
-- form_completed column existed all default to false. vozniki.residence_type
-- is only ever set by completeRegistration (regardless of program), so its
-- presence reliably identifies rows that were actually already completed.
update prijave
set form_completed = true
from vozniki
where vozniki.id = prijave.voznik_id
  and vozniki.residence_type is not null;
