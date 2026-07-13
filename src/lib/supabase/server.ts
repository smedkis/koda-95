import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Service-role client — bypasses RLS entirely, so this must only ever be
// imported from server-side code (Server Components / Server Actions). The
// `server-only` import above throws at build time if a client bundle tries
// to pull this module in.
type SupabaseServerClient = ReturnType<typeof createClient<Database>>;
let client: SupabaseServerClient | undefined;

export function getSupabaseServerClient(): SupabaseServerClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  client = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return client;
}
