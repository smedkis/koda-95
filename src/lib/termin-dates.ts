export function getDaysUntil(dateISO: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateISO}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// The "next" termin is whichever entry is chronologically closest among the
// ones still in the future — not just array order, since placeholder/admin
// entered data isn't guaranteed sorted.
export function isNextTermin(dateISO: string, allDatesISO: string[]): boolean {
  const nextDateISO = allDatesISO
    .map((d) => ({ dateISO: d, daysUntil: getDaysUntil(d) }))
    .filter((entry) => entry.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)[0]?.dateISO;
  return dateISO === nextDateISO;
}
