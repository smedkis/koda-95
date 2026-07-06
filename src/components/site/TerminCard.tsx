import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Box } from "@/components/ui/Box";
import { Heading3, Text } from "@/components/ui/Typography";
import { Link } from "@/i18n/navigation";
import { parseModul } from "@/lib/admin-termini-store";
import { cn } from "@/lib/cn";

function InfoRow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={icon} alt="" width={24} height={24} className="size-6 shrink-0" />
      <Text className="whitespace-nowrap">{children}</Text>
    </div>
  );
}

// Slovenian has dual number in addition to singular/plural, so "mesto"
// declines differently depending on the count (checked on the last two
// digits): 1 → mesto, 2 → mesti, 3-4 → mesta, 0 and 5+ → mest.
function formatProstaMesta(count: number): string {
  const lastTwoDigits = count % 100;
  if (lastTwoDigits === 1) return `${count} prosto mesto`;
  if (lastTwoDigits === 2) return `${count} prosti mesti`;
  if (lastTwoDigits === 3 || lastTwoDigits === 4) return `${count} prosta mesta`;
  return `${count} prostih mest`;
}

export type TerminCardProps = {
  title: string;
  date: string;
  address: string;
  timeRange: string;
  price?: string;
  attendeeCount?: number;
  capacity?: number;
  href: string;
  daysUntil?: number;
};

export function TerminCard({
  title,
  date,
  address,
  timeRange,
  price,
  attendeeCount,
  capacity,
  href,
  daysUntil,
}: TerminCardProps) {
  const t = useTranslations("TerminCard");
  const isNext = daysUntil !== undefined;
  const modul = parseModul(title);
  const cleanTitle = title.replace(/\s*\([^)]*\)\s*$/, "");
  const hasCapacity = capacity !== undefined && attendeeCount !== undefined;
  const percentage = hasCapacity
    ? Math.min(100, Math.round(((attendeeCount as number) / (capacity as number)) * 100))
    : 0;
  const spotsLeft = hasCapacity ? Math.max(0, (capacity as number) - (attendeeCount as number)) : 0;
  const isScarce = hasCapacity && spotsLeft < 10;

  return (
    <Box
      as={Link}
      href={href}
      className={
        isNext
          ? "relative flex flex-col border-2 border-transparent shadow-[0_16px_36px_-20px_rgba(245,130,32,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(245,130,32,0.55)]"
          : "relative flex flex-col transition-shadow hover:shadow-md"
      }
      style={
        isNext
          ? {
              // Same flat fill as a regular card's bg-secondary-bg — only the
              // border keeps its orange gradient to mark this as "next".
              backgroundImage: "linear-gradient(#FAFAFA, #FAFAFA), linear-gradient(90deg, #f58220, #ffab5c)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }
          : undefined
      }
    >
      {isNext ? (
        <span className="absolute left-6 top-0 inline-flex w-fit -translate-y-1/2 items-center rounded-full bg-gradient-to-r from-primary to-[#ffab5c] px-3 py-1.5 font-body text-[12px] font-semibold text-white shadow-[0_4px_12px_-3px_rgba(245,130,32,0.5)]">
          Naslednji termin · Čez {daysUntil} {daysUntil === 1 ? "dan" : "dni"}
        </span>
      ) : null}
      <Heading3>{cleanTitle}</Heading3>
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
        {modul ? <InfoRow icon="/Category.svg">Modul {modul}</InfoRow> : null}
        {price ? <InfoRow icon="/icon-ticket.svg">{price}</InfoRow> : null}
        <InfoRow icon="/icon-calendar.svg">{date}</InfoRow>
        <InfoRow icon="/icon-clock.svg">{timeRange}</InfoRow>
        <InfoRow icon="/icon-location.svg">{address}</InfoRow>
        {hasCapacity ? (
          <InfoRow icon="/icon-profile.svg">
            {attendeeCount}/{capacity}
          </InfoRow>
        ) : (
          <InfoRow icon="/icon-profile.svg">Neomejeno prostih mest</InfoRow>
        )}
      </div>
      {hasCapacity ? (
        <div className="mt-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-divider">
            <div
              className={cn("h-full rounded-full", isScarce ? "bg-[#852600]" : "bg-[#006e5e]")}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <Text className={cn("mt-2", isScarce ? "text-[#852600]" : "text-[#006e5e]")}>
            {isScarce ? "Veliko povpraševanja · " : ""}
            {formatProstaMesta(spotsLeft)}
          </Text>
        </div>
      ) : null}
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="inline-flex w-fit items-center justify-center gap-2 self-start rounded bg-secondary px-[14px] py-[10px] font-body text-[16px] font-medium text-paragraph transition-colors hover:bg-[#2db896]">
          {t("reserve")}
        </span>
        <Text className="whitespace-nowrap text-right text-[14px] font-medium text-[#006e5e]">
          Prijavi se zdaj, plačaj kasneje
        </Text>
      </div>
    </Box>
  );
}
