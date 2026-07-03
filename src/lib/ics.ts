function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Floating local time (no trailing Z, no TZID) — the event always shows at
// the wall-clock time given, which matches how termin dates/times are
// entered and displayed everywhere else in this app.
function formatFloatingDate(date: Date): string {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    "00"
  );
}

function formatUtcDate(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// timeRange is the "HH.MM - HH.MM" format used throughout this app
// (e.g. "15.00 - 21.00").
function parseTimeRange(date: string, timeRange: string): { start: Date; end: Date } {
  const [startStr, endStr] = timeRange.split("-").map((part) => part.trim());
  const [startHour, startMinute] = startStr.split(".").map(Number);
  const [endHour, endMinute] = endStr.split(".").map(Number);

  const start = new Date(`${date}T00:00:00`);
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date(`${date}T00:00:00`);
  end.setHours(endHour, endMinute, 0, 0);

  return { start, end };
}

export function buildIcsFile({
  title,
  location,
  date,
  timeRange,
}: {
  title: string;
  location: string;
  date: string;
  timeRange: string;
}): string {
  const { start, end } = parseTimeRange(date, timeRange);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tahografi Cuderman//Koda 95//SL",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@tahograficuderman.si`,
    `DTSTAMP:${formatUtcDate(new Date())}`,
    `DTSTART:${formatFloatingDate(start)}`,
    `DTEND:${formatFloatingDate(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
