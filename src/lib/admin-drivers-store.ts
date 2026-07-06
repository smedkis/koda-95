import type { TerminDriver } from "@/components/admin/AdminTerminDriversTable";
import { PLACEHOLDER_DRIVERS } from "@/lib/admin-drivers-data";
import { PLACEHOLDER_PAST_TERMINI, PLACEHOLDER_TERMINI } from "@/lib/admin-termini-data";
import { getAddedTermini, getTerminOverrides } from "@/lib/admin-termini-store";

// Same rationale as admin-termini-store.ts: no backend yet, so the driver
// list per termin (including manual additions and edits) is kept in
// localStorage, keyed by termin id, so it survives navigating from the
// termin detail page to a driver's edit page and back.
const STORAGE_KEY = "koda95_admin_drivers";

// Bump this whenever PLACEHOLDER_DRIVERS' shape changes (new fields, etc.) —
// a mismatch wipes the stored cache so browsers with an older seed pick up
// the new placeholder fields automatically instead of showing stale/missing
// data until someone manually clears localStorage.
const STORE_VERSION = 2;

type StoredShape = { version: number; data: Record<string, TerminDriver[]> };

function readAll(): Record<string, TerminDriver[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredShape;
    if (parsed.version !== STORE_VERSION) return {};
    return parsed.data;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, TerminDriver[]>) {
  if (typeof window === "undefined") return;
  const stored: StoredShape = { version: STORE_VERSION, data };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

// On first read for a termin, the placeholder seed is persisted so it can
// be found and edited by id from the driver edit page.
export function getDriversForTermin(terminId: string, seed: TerminDriver[]): TerminDriver[] {
  const all = readAll();
  if (all[terminId]) return all[terminId];
  all[terminId] = seed;
  writeAll(all);
  return seed;
}

export function saveDriversForTermin(terminId: string, drivers: TerminDriver[]) {
  const all = readAll();
  all[terminId] = drivers;
  writeAll(all);
}

export function addDriverToTermin(terminId: string, driver: TerminDriver, seed: TerminDriver[]) {
  const current = getDriversForTermin(terminId, seed);
  saveDriversForTermin(terminId, [driver, ...current]);
}

export function updateDriverInTermin(terminId: string, driver: TerminDriver, seed: TerminDriver[]) {
  const current = getDriversForTermin(terminId, seed);
  const index = current.findIndex((entry) => entry.id === driver.id);
  if (index === -1) return;
  const next = [...current];
  next[index] = driver;
  saveDriversForTermin(terminId, next);
}

export type DriverSearchResult = {
  driver: TerminDriver;
  terminId: string;
  terminTitle: string;
};

function getAllTermini(): { id: string; title: string; date: string }[] {
  const byId = new Map<string, { id: string; title: string; date: string }>();
  for (const termin of [...PLACEHOLDER_TERMINI, ...PLACEHOLDER_PAST_TERMINI]) {
    byId.set(termin.id, termin);
  }
  for (const termin of getAddedTermini()) {
    byId.set(termin.id, termin);
  }
  for (const [id, termin] of Object.entries(getTerminOverrides())) {
    byId.set(id, termin);
  }
  return Array.from(byId.values());
}

// Multiple termini can share the exact same title (e.g. every "Redno
// usposabljanje Koda 95" module), so search results show the date alongside
// it to tell them apart — the title's own trailing "(...)" (module year) is
// stripped first so it doesn't end up with two parenthetical bits.
function formatTerminLabel(termin: { title: string; date: string }): string {
  const cleanTitle = termin.title.replace(/\s*\([^)]*\)\s*$/, "");
  return `${cleanTitle} (${termin.date})`;
}

// Searches every termin's driver list (not just the one currently open) by
// name, email or phone — used by the global nav search.
export function searchDrivers(query: string): DriverSearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const results: DriverSearchResult[] = [];
  for (const termin of getAllTermini()) {
    const drivers = getDriversForTermin(termin.id, PLACEHOLDER_DRIVERS);
    for (const driver of drivers) {
      const haystack = `${driver.driverName} ${driver.email ?? ""} ${driver.phone ?? ""}`.toLowerCase();
      if (haystack.includes(trimmed)) {
        results.push({ driver, terminId: termin.id, terminTitle: formatTerminLabel(termin) });
      }
    }
  }
  return results.slice(0, 8);
}

// Every registration across every termin — used by the statistika page for
// the monthly count and the PDF export.
export function getAllRegistrations(): DriverSearchResult[] {
  const results: DriverSearchResult[] = [];
  for (const termin of getAllTermini()) {
    const drivers = getDriversForTermin(termin.id, PLACEHOLDER_DRIVERS);
    for (const driver of drivers) {
      results.push({ driver, terminId: termin.id, terminTitle: formatTerminLabel(termin) });
    }
  }
  return results;
}
