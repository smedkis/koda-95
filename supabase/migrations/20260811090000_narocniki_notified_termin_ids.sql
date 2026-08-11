-- The bulk "Pošlji obvestilo" send used to dedupe by calendar day
-- (last_notified_at = today), which breaks the moment a run needs to
-- resume on a different day (e.g. after hitting Resend's daily quota) —
-- "today" becomes a new date and everyone already emailed looks eligible
-- again. Tracking which specific termini each contact has already been
-- told about is immune to that: a recipient is only skipped once every
-- currently selected termin is already in their notified set, regardless
-- of what day that happened on.
alter table narocniki add column notified_termin_ids text[] not null default '{}';
