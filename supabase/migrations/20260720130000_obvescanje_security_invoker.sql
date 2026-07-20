-- Views default to running with the *owner's* privileges rather than the
-- querying role's (Postgres calls this "security definer" semantics for
-- views), which lets a view silently bypass RLS on its underlying tables —
-- exactly what "every table has RLS enabled with zero policies, all access
-- server-mediated" was supposed to prevent. Without this, Supabase's public
-- REST API could let the anon key read every driver's name, email, phone,
-- and registration code straight out of this view, no auth required.
alter view obvescanje set (security_invoker = true);
