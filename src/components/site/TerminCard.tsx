import Image from "next/image";
import { useTranslations } from "next-intl";
import { Box } from "@/components/ui/Box";
import { Heading3, Text, TextMedium, TextSmall } from "@/components/ui/Typography";
import { Link } from "@/i18n/navigation";
import { parseModul } from "@/lib/termini-format";
import { cn } from "@/lib/cn";

// Deterministic per-termin jitter (same termin always gets the same value,
// so it doesn't change on every reload) so the progress-bar floor below
// doesn't land on the exact same number on every card.
function hashToRange(value: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return min + (Math.abs(hash) % (max - min + 1));
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

function HeroChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FFEEDD]">
        <Image src={icon} alt="" width={18} height={18} className="size-[18px]" />
      </span>
      <div className="min-w-0">
        <TextSmall className="text-[12px] text-placeholder">{label}</TextSmall>
        <TextMedium className="truncate text-[16px] font-semibold text-heading">{value}</TextMedium>
      </div>
    </div>
  );
}

function SecondaryItem({ icon, children }: { icon: string; children: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary-bg">
        <Image src={icon} alt="" width={12} height={12} className="size-3" />
      </span>
      <Text className="text-[14px] text-paragraph">{children}</Text>
    </div>
  );
}

export type TerminCardProps = {
  title: string;
  date: string;
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
  // Never show a near-empty bar — a session with 0-2 signups shouldn't
  // visually read as "nobody wants this", so the bar itself has a floor
  // around 33% (jittered per termin so cards don't all match exactly).
  // The real count is still what's written out below it.
  const floorPercentage = hashToRange(href, 28, 38);
  const percentage = hasCapacity
    ? Math.max(
        floorPercentage,
        Math.min(100, Math.round(((attendeeCount as number) / (capacity as number)) * 100)),
      )
    : 0;
  const spotsLeft = hasCapacity ? Math.max(0, (capacity as number) - (attendeeCount as number)) : 0;
  const isScarce = hasCapacity && spotsLeft < 10;

  // The two facts someone scans a termin card for first: when it is, and
  // either what it costs or whether there's still room. Everything else
  // (time, location, modul, exact headcount) is secondary detail below.
  const heroRight = price
    ? { icon: "/icon-ticket.svg", label: "Cena", value: price }
    : hasCapacity
      ? { icon: "/icon-profile.svg", label: "Prosta mesta", value: `${attendeeCount}/${capacity}` }
      : { icon: "/icon-profile.svg", label: "Prosta mesta", value: "Neomejeno" };

  const secondaryItems: { icon: string; label: string }[] = [];
  if (modul) secondaryItems.push({ icon: "/Category.svg", label: `Modul ${modul}` });
  secondaryItems.push({ icon: "/icon-clock.svg", label: timeRange ?? "Po dogovoru" });
  secondaryItems.push({ icon: "/icon-location.svg", label: address ?? "Po dogovoru" });

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
              // Warm-tinted fill (instead of the flat #FAFAFA regular cards
              // use) so the "next" card stands out on its own, not just via
              // the border.
              backgroundImage: "linear-gradient(#FFF4E8, #FFF4E8), linear-gradient(90deg, #f58220, #ffab5c)",
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

      <div className="mt-6 grid grid-cols-2 gap-4">
        <HeroChip icon="/icon-calendar.svg" label="Datum" value={date} />
        <HeroChip icon={heroRight.icon} label={heroRight.label} value={heroRight.value} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-divider pt-4">
        {secondaryItems.map((item) => (
          <SecondaryItem key={item.label} icon={item.icon}>
            {item.label}
          </SecondaryItem>
        ))}
      </div>

      {hasCapacity ? (
        <div className="mt-5">
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

      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="inline-flex w-full items-center justify-center gap-2 rounded bg-secondary px-[14px] py-[10px] font-body text-[16px] font-medium text-paragraph transition-colors hover:bg-[#5de0c0]">
          {t("reserve")}
        </span>
        <Text className="text-[13px] font-medium text-[#006e5e]">Prijavi se zdaj, plačaj kasneje</Text>
      </div>
    </Box>
  );
}
