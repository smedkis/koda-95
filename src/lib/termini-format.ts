// Pure display-formatting helpers shared by server data modules and client
// components (e.g. AdminTerminForm's live preview), so no "server-only"
// guard here.

import sl from "../../messages/sl.json";
import en from "../../messages/en.json";
import sr from "../../messages/sr.json";

// Admin has no i18n (single language, always Slovenian), and is by far the
// most common caller of the locale-aware helpers below — defaulting to "sl"
// means those call sites don't need to pass anything. Public-facing callers
// (termin pages, registration emails) pass the visitor's real locale
// explicitly. Plain static imports rather than next-intl's getTranslations
// because these are synchronous, non-React helpers used from both server
// data modules and client components (e.g. AdminTerminForm's live preview).
type Messages = {
  Weekdays: string[];
  TerminTitle: { redna: string; zacetna: string };
  Programs: { zacetna: { priceFrom: string } };
};
const MESSAGES: Record<string, Messages> = { sl, en, sr };

function getMessages(locale: string): Messages {
  return MESSAGES[locale] ?? MESSAGES.sl;
}

export function formatSlovenianDate(isoDate: string, locale = "sl"): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekday = getMessages(locale).Weekdays[date.getDay()];
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

export function buildTerminTitle(
  program: "redna" | "zacetna",
  modul?: number | null,
  locale = "sl",
): string {
  const messages = getMessages(locale).TerminTitle;
  return program === "redna"
    ? messages.redna.replace("{modul}", String(modul))
    : messages.zacetna;
}

// The modul number is always the trailing "(... 1234)" in the title,
// regardless of which language's word for "Module" precedes it.
export function parseModul(title: string): string | undefined {
  const match = title.match(/\(\D*(\d{4})\)\s*$/);
  return match ? match[1] : undefined;
}

// Začetno usposabljanje termini can go live with no fixed price yet — rather
// than showing nothing, the public site shows a "starting from" estimate
// (client-provided figure) instead. Redna termini always have a real price
// by the time they're published, so no program arg means no fallback.
export function formatPriceEur(
  priceEur: number | null,
  program?: "redna" | "zacetna",
  locale = "sl",
): string | undefined {
  if (priceEur === null) {
    return program === "zacetna" ? getMessages(locale).Programs.zacetna.priceFrom : undefined;
  }
  return `${priceEur} EUR z DDV`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
