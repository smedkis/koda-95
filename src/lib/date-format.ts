// Pure date helpers shared by server data modules and client components
// (e.g. AdminVoznikEditContent's date-of-birth field), so no "server-only"
// guard here.

export function isoToDmy(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

export function dmyToIso(dmy: string): string | null {
  const match = dmy.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export const formatDateDMY = isoToDmy;

export function formatToday(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${now.getFullYear()}`;
}
