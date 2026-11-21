import { useLocale } from "next-intl";
import { cn } from "@/lib/cn";
import { getCalendarParts } from "@/lib/termini-format";

// Tear-off calendar page (month band, big day number, weekday) shown on the
// termin card and the termin detail page. The slight 3D comes from a top-lit
// gradient on the band (the admin calendar's sage green), a soft drop
// shadow, and a second "page" peeking out underneath. Decorative only — the
// date is always also written out in text next to it.
export function CalendarTile({ dateISO, className }: { dateISO: string; className?: string }) {
  const locale = useLocale();
  const { month, day, weekday } = getCalendarParts(dateISO, locale);

  return (
    <div aria-hidden="true" className={cn("relative w-[76px] shrink-0 sm:w-[88px]", className)}>
      <div className="absolute inset-x-1.5 -bottom-1.5 h-4 rounded-b-lg border border-divider bg-[#F4F4F4]" />
      <div className="relative overflow-hidden rounded-lg border border-[#E6E6E6] bg-white text-center shadow-[0_1px_0_rgba(0,0,0,0.04),0_6px_14px_-4px_rgba(64,46,50,0.22)]">
        <div className="bg-linear-to-b from-[#afbfb3] to-[#9eb0a2] py-1 font-body text-[13px] font-bold tracking-[0.08em] text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)]">
          {month}
        </div>
        <div className="bg-linear-to-b from-white to-[#F7F7F7]">
          <div className="font-heading text-[34px] leading-[40px] font-semibold text-heading sm:text-[40px] sm:leading-[48px]">
            {day}
          </div>
          <div className="pb-2 font-body text-[13px] text-paragraph">{weekday}</div>
        </div>
      </div>
    </div>
  );
}
