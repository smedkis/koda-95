// Slovenian EMŠO format: 13 digits, DDMMLLLRRBBBK where DD=day, MM=month,
// and the 5th digit is a century marker (8=1800s, 9=1900s, 0=2000s)
// followed by a 2-digit year within that century. Returns an ISO date
// string (YYYY-MM-DD) for use as an <input type="date"> value, or null if
// the EMŠO isn't a valid 13-digit birth-date-bearing number.
export function parseEmsoBirthDate(emso: string): string | null {
  if (!/^\d{13}$/.test(emso)) return null;

  const day = Number(emso.slice(0, 2));
  const month = Number(emso.slice(2, 4));
  const centuryDigit = emso[4];
  const yearInCentury = Number(emso.slice(5, 7));

  const centuryBase: Record<string, number> = { "8": 1800, "9": 1900, "0": 2000 };
  const century = centuryBase[centuryDigit];
  if (century === undefined) return null;

  const year = century + yearInCentury;

  const date = new Date(year, month - 1, day);
  const isValid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isValid) return null;

  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}
