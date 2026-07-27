// Pure parsing for the "uvoz preteklih usposabljanj" admin form — no
// Supabase access here, so this can run client-side for a live preview
// before the admin confirms the import (see UvozZgodovinePageContent).
//
// The source is a legacy export, one completed lecture per line, shaped like:
//   Ime Priimek <telefon> "<Dan>, <datum>, <čas ali "ob <ura>">, RU/Tema <leto>, <naslov>" <telefon (isti)> <e-pošta>
// e.g.
//   JANEZ JEREB 041 706 530 "Sobota, 25.04.2026, od 08:00 do 14:00, RU 2024, Ljubljanska cesta 30, 4000 Kranj" 041 706 530 jereb@jereb.si
// There's no EMŠO in this export — the phone number is the only stable
// per-driver key (it repeats identically across a person's rows; email
// sometimes doesn't, since several drivers share one company inbox).
import type { ProgramKey } from "@/lib/supabase/database.types";

export type ParsedZunanjeUsposabljanjeRow = {
  fullName: string;
  phone: string | null;
  email: string | null;
  program: ProgramKey;
  modul: number | null;
  date: string;
  note: string | null;
};

export type ParseError = { line: number; raw: string; message: string };

export type ParseResult = {
  rows: ParsedZunanjeUsposabljanjeRow[];
  errors: ParseError[];
};

// A date like "24. 05. 2026", "25.04.2026" or "6.2.2026" — day/month can be
// one or two digits, with or without a space after the dot.
const DATE_PATTERN = /(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/;
// "RU 2026" or "(Tema 2025)" — both name the annual redna module; a literal
// "ZU" would mean začetna, which has no yearly module.
const MODUL_PATTERN = /\b(RU|ZU|Tema)\s*(\d{4})/i;
// A trailing run of digits/spaces/dashes/plus is treated as the phone
// number; a name never looks like that.
const PHONE_TOKEN = /^[\d+\-]+$/;

function parseDate(raw: string): string | null {
  const match = raw.match(DATE_PATTERN);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseProgramAndModul(raw: string): { program: ProgramKey; modul: number | null } | null {
  const match = raw.match(MODUL_PATTERN);
  if (!match) return null;
  const [, marker, year] = match;
  if (marker.toUpperCase() === "ZU") return { program: "zacetna-koda-95", modul: null };
  return { program: "redna-koda-95", modul: Number.parseInt(year, 10) };
}

// The same person shows up with inconsistent formatting across rows (e.g.
// "041 618 666" vs "41618666" for the same Slovenian mobile) — normalize to
// digits-only with the trunk "0" restored so both match for dedup purposes.
// Longer (international-prefixed) numbers are left as-is; they're rare
// enough in this export that a wrong guess is worse than no normalization.
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 1) return null; // "0" is a "no phone on file" placeholder
  if (digits.length === 8) return `0${digits}`;
  return digits;
}

function splitNameAndPhone(prefix: string): { name: string; phone: string | null } {
  const tokens = prefix.trim().split(/\s+/).filter(Boolean);
  const phoneStart = tokens.findIndex((token) => PHONE_TOKEN.test(token));
  if (phoneStart === -1) return { name: tokens.join(" "), phone: null };

  const name = tokens.slice(0, phoneStart).join(" ");
  const phoneRaw = tokens.slice(phoneStart).join(" ");
  return { name, phone: normalizePhone(phoneRaw) };
}

export function parseZunanjaUsposabljanja(raw: string): ParseResult {
  const lines = raw
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.trim().length > 0);

  const rows: ParsedZunanjeUsposabljanjeRow[] = [];
  const errors: ParseError[] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const quoted = line.match(/"([^"]*)"/);
    if (!quoted || quoted.index === undefined) {
      errors.push({
        line: lineNumber,
        raw: line,
        message: "Manjka citiran opis termina (med narekovaji).",
      });
      return;
    }

    const sessionStr = quoted[1];
    const prefix = line.slice(0, quoted.index);
    const suffix = line.slice(quoted.index + quoted[0].length);

    const { name: fullName, phone } = splitNameAndPhone(prefix);
    if (!fullName) {
      errors.push({ line: lineNumber, raw: line, message: "Manjka ime in priimek." });
      return;
    }

    const suffixTokens = suffix.trim().split(/\s+/).filter(Boolean);
    const lastToken = suffixTokens[suffixTokens.length - 1];
    const email = lastToken && lastToken.includes("@") ? lastToken : null;

    const date = parseDate(sessionStr);
    if (!date) {
      errors.push({
        line: lineNumber,
        raw: line,
        message: `V opisu termina ni najti veljavnega datuma: "${sessionStr}".`,
      });
      return;
    }

    const programModul = parseProgramAndModul(sessionStr);
    if (!programModul) {
      errors.push({
        line: lineNumber,
        raw: line,
        message: `V opisu termina ni najti programa/modula (RU, ZU ali Tema): "${sessionStr}".`,
      });
      return;
    }

    rows.push({
      fullName,
      phone,
      email,
      program: programModul.program,
      modul: programModul.modul,
      date,
      note: sessionStr,
    });
  });

  return { rows, errors };
}
