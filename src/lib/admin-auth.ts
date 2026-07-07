import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

// Single hardcoded admin account (no users table) — credentials come from
// ADMIN_USERNAME/ADMIN_PASSWORD env vars.
export const ADMIN_SESSION_COOKIE = "koda95_admin_session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days, matches the cookie's maxAge

// Sessions are persisted to a small file on disk rather than kept in an
// in-memory Map. Next.js compiles proxy.ts as a module graph separate from
// Server Actions/pages ("Proxy is meant to be invoked separately... you
// should not attempt relying on shared modules or globals" — Next.js docs),
// so an in-memory store created by the login action isn't reliably visible
// to proxy.ts's own copy of this module (confirmed: it worked once right
// after both were freshly compiled together, then broke the moment one side
// got recompiled independently). A file on disk sidesteps that entirely,
// since it's the same physical file no matter which bundle touches it. If
// this ever moves to a multi-instance/edge-distributed deployment, this
// needs to become a real shared store (e.g. Redis) instead.
const SESSIONS_FILE = path.join(os.tmpdir(), "koda95-admin-sessions.json");

type SessionsData = Record<string, number>; // token -> expiresAt

function readSessions(): SessionsData {
  try {
    return JSON.parse(fs.readFileSync(SESSIONS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeSessions(sessions: SessionsData) {
  const now = Date.now();
  const pruned = Object.fromEntries(
    Object.entries(sessions).filter(([, expiresAt]) => expiresAt > now),
  );
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(pruned));
}

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

export function createSession(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const sessions = readSessions();
  sessions[token] = Date.now() + SESSION_TTL_MS;
  writeSessions(sessions);
  return token;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expiresAt = readSessions()[token];
  return expiresAt !== undefined && Date.now() <= expiresAt;
}

export function revokeSession(token: string | undefined) {
  if (!token) return;
  const sessions = readSessions();
  if (token in sessions) {
    delete sessions[token];
    writeSessions(sessions);
  }
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
