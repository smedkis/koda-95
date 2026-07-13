// Pure display-formatting helpers shared by server data modules and client
// components (e.g. AdminTerminForm's live preview), so no "server-only"
// guard here.

const WEEKDAYS = ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"];

export function formatSlovenianDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekday = WEEKDAYS[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${weekday}, ${day}.${month}. ${date.getFullYear()}`;
}

// Postgres `time` columns come back as "HH:MM:SS" — both this and a plain
// "HH:MM" (native <input type="time"> value) need to work.
export function toHoursMinutes(time: string): string {
  return time.slice(0, 5);
}

export function formatTimeRange(
  start: string | null,
  end: string | null,
): string | undefined {
  if (start === null || end === null) return undefined;
  return `${toHoursMinutes(start).replace(":", ".")} - ${toHoursMinutes(end).replace(":", ".")}`;
}

export function buildTerminTitle(program: "redna" | "zacetna", modul?: number | null): string {
  return program === "redna"
    ? `Redno usposabljanje Koda 95 (Modul ${modul})`
    : "Začetno usposabljanje Koda 95";
}

export function parseModul(title: string): string | undefined {
  const match = title.match(/\((?:Modul\s*)?(\d{4})\)/);
  return match ? match[1] : undefined;
}

export function formatPriceEur(priceEur: number | null): string | undefined {
  if (priceEur === null) return undefined;
  return `${priceEur} EUR z DDV`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
