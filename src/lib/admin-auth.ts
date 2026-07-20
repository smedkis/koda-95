import crypto from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Single hardcoded admin account (no users table) — credentials come from
// ADMIN_USERNAME/ADMIN_PASSWORD env vars.
export const ADMIN_SESSION_COOKIE = "koda95_admin_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days, matches the cookie's maxAge

function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Still do a same-size comparison so a length mismatch doesn't return
    // faster than a same-length mismatch would.
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function verifyCredentials(username: string, password: string): boolean {
  const validUsername = timingSafeStringEqual(username, process.env.ADMIN_USERNAME ?? "");
  const validPassword = timingSafeStringEqual(password, process.env.ADMIN_PASSWORD ?? "");
  return validUsername && validPassword;
}

// Sessions live in Postgres rather than a local file or in-memory Map —
// proxy.ts checks them from the Edge Runtime (no access to Node's `fs`), and
// Vercel's serverless instances don't share a filesystem or memory with each
// other anyway, so anything not in a real shared store is invisible half the
// time in production.
export async function createSession(): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const client = getSupabaseServerClient();
  await client.from("admin_sessions").insert({
    token,
    expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });
  return token;
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const client = getSupabaseServerClient();
  const { data } = await client
    .from("admin_sessions")
    .select("expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!data) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}

export async function revokeSession(token: string | undefined): Promise<void> {
  if (!token) return;
  const client = getSupabaseServerClient();
  await client.from("admin_sessions").delete().eq("token", token);
}

// Naive in-memory brute-force guard for the login form, keyed by client IP.
// Resets on server restart and doesn't coordinate across instances if this
// is ever scaled horizontally, but still raises the bar against naive
// automated password guessing against the one account guarding every
// driver's personal data.
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 1000 * 60 * 15; // 15 minutes
const loginAttempts = new Map<string, { count: number; windowStart: number }>();

function getAttemptWindow(identifier: string) {
  const entry = loginAttempts.get(identifier);
  if (!entry || Date.now() - entry.windowStart > LOGIN_ATTEMPT_WINDOW_MS) {
    return null;
  }
  return entry;
}

export function isLoginRateLimited(identifier: string): boolean {
  const entry = getAttemptWindow(identifier);
  return entry !== null && entry.count >= LOGIN_ATTEMPT_LIMIT;
}

export function recordFailedLogin(identifier: string) {
  const entry = getAttemptWindow(identifier);
  if (!entry) {
    loginAttempts.set(identifier, { count: 1, windowStart: Date.now() });
    return;
  }
  entry.count += 1;
}

export function clearLoginAttempts(identifier: string) {
  loginAttempts.delete(identifier);
}
