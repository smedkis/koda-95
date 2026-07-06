import type { AdminTerminCardProps } from "@/components/admin/AdminTerminCard";

// Termini created/edited in the admin UI aren't backed by a database yet, so
// changes are kept in localStorage — this survives client-side navigation
// within the same browser, until the real Supabase-backed create/edit flow
// replaces this. Two stores: one for termini created from scratch, one for
// edits applied on top of the server-provided placeholder termini (which
// can't be mutated directly since they're static exported arrays).
const ADDED_KEY = "koda95_admin_added_termini";
const OVERRIDES_KEY = "koda95_admin_termini_overrides";

export type StoredTermin = AdminTerminCardProps & {
  program: "redna" | "zacetna";
  dateISO: string;
  startTime: string;
  endTime: string;
  modul?: string;
};

export function getAddedTermini(): StoredTermin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADDED_KEY);
    return raw ? (JSON.parse(raw) as StoredTermin[]) : [];
  } catch {
    return [];
  }
}

export function addTermin(termin: StoredTermin) {
  if (typeof window === "undefined") return;
  const current = getAddedTermini();
  window.localStorage.setItem(ADDED_KEY, JSON.stringify([...current, termin]));
}

export function getTerminOverrides(): Record<string, StoredTermin> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredTermin>) : {};
  } catch {
    return {};
  }
}

// Edits to a termin created via Dodaj termin update that same record in
// place; edits to one of the server-provided placeholder termini are kept
// as a separate override (keyed by id) and layered on top when reading.
export function saveTerminEdit(termin: StoredTermin) {
  if (typeof window === "undefined") return;
  const added = getAddedTermini();
  const addedIndex = added.findIndex((entry) => entry.id === termin.id);
  if (addedIndex !== -1) {
    added[addedIndex] = termin;
    window.localStorage.setItem(ADDED_KEY, JSON.stringify(added));
    return;
  }
  const overrides = getTerminOverrides();
  overrides[termin.id] = termin;
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

const WEEKDAYS = ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"];

export function formatSlovenianDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekday = WEEKDAYS[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${weekday}, ${day}.${month}. ${date.getFullYear()}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${start.replace(":", ".")} - ${end.replace(":", ".")}`;
}

// Reverse of formatSlovenianDate — needed to prefill the edit form's native
// date input from termini whose only stored date is the display string
// (the pre-existing placeholder termini, not created through Dodaj termin).
export function parseSlovenianDate(display: string): string {
  const match = display.match(/(\d{2})\.(\d{2})\.\s*(\d{4})/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function parseTimeRange(timeRange: string): { start: string; end: string } {
  const [start, end] = timeRange.split(" - ").map((part) => part.trim().replace(".", ":"));
  return { start: start ?? "15:00", end: end ?? "21:00" };
}

export function parseModul(title: string): string | undefined {
  const match = title.match(/\((?:Modul\s*)?(\d{4})\)/);
  return match ? match[1] : undefined;
}
