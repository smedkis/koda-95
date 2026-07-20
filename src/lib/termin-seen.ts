export const TERMIN_SEEN_COOKIE = "termin_seen_at";

// Cookie value is a JSON object mapping termin slug -> ISO timestamp of the
// admin's last visit to that termin's detail page.
export function parseTerminSeenMap(raw: string | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}
