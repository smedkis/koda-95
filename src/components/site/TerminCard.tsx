import { useLocale, useTranslations } from "next-intl";
import { Box } from "@/components/ui/Box";
import { Text } from "@/components/ui/Typography";
import { Link } from "@/i18n/navigation";
import { formatLongDate, parseModul } from "@/lib/termini-format";
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

  const longDate = formatLongDate(dateISO, locale);
  const eyebrow = modul ? `${cleanTitle} · ${t("modulLabel")} ${modul}` : cleanTitle;
  const details = [timeRange ?? t("timeAgreed"), address ?? t("locationAgreed")].join(" · ");

  // Kept deliberately plain and in the site's own vocabulary (flat grey Box,
  // hairline divider, the hero's orange button) rather than chips/shadows:
  // the date is the headline because "when" is what people scan for first,
  // and the bottom row pairs the price with the one action.
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

      <h3 className="font-body text-[13px] font-semibold uppercase tracking-[0.06em] text-placeholder">
        {eyebrow}
      </h3>
      <p className="mt-3 font-heading text-[26px] leading-[32px] font-semibold text-heading sm:text-[30px] sm:leading-[38px]">
        {longDate}
      </p>
      <Text className="mt-2 text-[16px] text-paragraph">{details}</Text>

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
