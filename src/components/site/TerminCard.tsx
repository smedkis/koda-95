import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Typography";
import { Link } from "@/i18n/navigation";
import { getCalendarParts, parseModul } from "@/lib/termini-format";
import { cn } from "@/lib/cn";

// Deterministic per-termin jitter (same termin always gets the same value,
// so it doesn't change on every reload) so the "spots left" count below
// doesn't land on the exact same number on every card.
function hashToRange(value: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return min + (Math.abs(hash) % (max - min + 1));
}

export type TerminCardProps = {
  title: string;
  date: string;
  dateISO: string;
  address?: string;
  timeRange?: string;
  price?: string;
  attendeeCount?: number;
  capacity?: number;
  href: string;
  daysUntil?: number;
};

export function TerminCard({
  title,
  dateISO,
  address,
  timeRange,
  price,
  attendeeCount,
  capacity,
  href,
  daysUntil,
}: TerminCardProps) {
  const t = useTranslations("TerminCard");
  const locale = useLocale();
  const isNext = daysUntil !== undefined;
  const modul = parseModul(title);
  const cleanTitle = title.replace(/\s*\([^)]*\)\s*$/, "");
  const hasCapacity = capacity !== undefined && attendeeCount !== undefined;
  // Nudge the displayed count up slightly (by at most 2, deterministic per
  // termin so it's stable across reloads) so a session with real 0-1
  // signups doesn't read as "nobody wants this" — kept small so it stays
  // close to the real number instead of every card looking the same.
  const jitter = hasCapacity ? hashToRange(href, 0, 2) : 0;
  const displayedAttendeeCount = hasCapacity
    ? Math.min(capacity as number, (attendeeCount as number) + jitter)
    : 0;
  const spotsLeft = hasCapacity ? Math.max(0, (capacity as number) - displayedAttendeeCount) : 0;
  const isScarce = hasCapacity && spotsLeft <= 3;

  const calendar = getCalendarParts(dateISO, locale);

  // Reads as an appointment: a tear-off calendar page on the left (month in
  // the brand orange, big day number) next to what/when/where, then the
  // price and the one action. Kept in the site's own vocabulary (flat grey
  // Box, hairline divider, the hero's orange button) rather than chips or
  // drop shadows.
  return (
    <Box
      as={Link}
      href={href}
      className={cn(
        "group relative flex flex-col transition-colors hover:border-primary",
        isNext && "border-2 border-primary",
      )}
    >
      {isNext ? (
        <span className="absolute left-6 top-0 inline-flex w-fit -translate-y-[calc(50%+1px)] items-center rounded-full bg-primary px-3 py-1.5 font-body text-[12px] font-semibold text-white">
          {t("nextBadge", { days: daysUntil })}
        </span>
      ) : null}

      <div className="flex gap-5 sm:gap-6">
        {/* Tear-off calendar page. The slight 3D comes from a top-lit
            gradient on the header band, a soft drop shadow, and a second
            "page" peeking out underneath. */}
        <div aria-hidden="true" className="relative w-[76px] shrink-0 self-start sm:w-[88px]">
          <div className="absolute inset-x-1.5 -bottom-1.5 h-4 rounded-b-lg border border-divider bg-[#F4F4F4]" />
          <div className="relative overflow-hidden rounded-lg border border-[#E6E6E6] bg-white text-center shadow-[0_1px_0_rgba(0,0,0,0.04),0_6px_14px_-4px_rgba(64,46,50,0.22)]">
            <div className="bg-linear-to-b from-[#afbfb3] to-[#9eb0a2] py-1 font-body text-[13px] font-bold tracking-[0.08em] text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)]">
              {calendar.month}
            </div>
            <div className="bg-linear-to-b from-white to-[#F7F7F7]">
              <div className="font-heading text-[34px] leading-[40px] font-semibold text-heading sm:text-[40px] sm:leading-[48px]">
                {calendar.day}
              </div>
              <div className="pb-2 font-body text-[13px] text-paragraph">{calendar.weekday}</div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="font-heading text-[18px] leading-[24px] font-semibold text-heading sm:text-[20px] sm:leading-[28px]">
            {cleanTitle}
          </h3>
          {modul ? (
            <Text className="mt-0.5 text-[14px] text-placeholder">
              {t("modulLabel")} {modul}
            </Text>
          ) : null}
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Image src="/icon-clock.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
              <Text className="text-[15px] text-paragraph">{timeRange ?? t("timeAgreed")}</Text>
            </div>
            <div className="flex items-center gap-2">
              <Image src="/icon-location.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
              <Text className="text-[15px] text-paragraph">{address ?? t("locationAgreed")}</Text>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-divider pt-6">
        <div>
          {price ? (
            <p className="font-heading text-[20px] font-semibold text-heading">{price}</p>
          ) : null}
          {hasCapacity ? (
            <Text
              className={cn(
                "text-[14px]",
                isScarce ? "font-semibold text-primary" : "text-paragraph",
              )}
            >
              {isScarce ? `${t("highDemand")} · ` : ""}
              {t("spotsLeft", { count: spotsLeft })}
            </Text>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1.5 max-sm:w-full max-sm:items-stretch">
          <span className="inline-flex items-center justify-center gap-2 rounded bg-primary px-5 py-3 font-body text-[16px] font-medium text-white transition-colors group-hover:bg-[#d06e1b]">
            {t("reserve")}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
          <Text className="text-[13px] text-placeholder max-sm:text-center">{t("payLater")}</Text>
        </div>
      </div>
    </Box>
  );
}
