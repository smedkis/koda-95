-- Admin login sessions were stored in a JSON file on local disk
-- (os.tmpdir()), which only works on a single long-lived server. On Vercel,
-- each request can land on a different serverless instance with its own
-- separate /tmp, and the login-checking code runs in the Edge Runtime
-- (proxy.ts), which can't use Node's `fs` module at all — so in production
-- this silently broke admin login entirely. Moving sessions into Postgres
-- gives every instance (and both runtimes) a real shared store.

create table admin_sessions (
  token text primary key,
  expires_at timestamptz not null
);

create index admin_sessions_expires_at_idx on admin_sessions (expires_at);

alter table admin_sessions enable row level security;
