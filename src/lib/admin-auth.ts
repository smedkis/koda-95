// Single hardcoded admin account (no users table) — credentials come from
// ADMIN_USERNAME/ADMIN_PASSWORD env vars. Uses Web Crypto (crypto.subtle)
// instead of Node's crypto module so this also works from proxy.ts, which
// runs on the Edge runtime.
export const ADMIN_SESSION_COOKIE = "koda95_admin_session";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeSessionToken(): Promise<string> {
  return sha256Hex(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}:koda95-admin-session`);
}

export function verifyCredentials(username: string, password: string): boolean {
  return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await computeSessionToken();
  return token === expected;
}
