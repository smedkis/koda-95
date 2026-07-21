-- Persists the visitor's locale at registration time so background jobs
-- (like the day-before training reminder) can email in the right language —
-- previously locale only existed transiently during the registration
-- request itself, unavailable to anything running later.
alter table prijave add column locale text not null default 'sl';

-- Tracks whether the day-before "usposabljanje je jutri" reminder has
-- already been sent for this registration, so a retried/duplicate cron run
-- never double-sends it.
alter table prijave add column reminder_sent_at timestamptz;
