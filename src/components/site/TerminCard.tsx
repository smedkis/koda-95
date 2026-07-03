import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Box } from "@/components/ui/Box";
import { ButtonLink } from "@/components/ui/Button";
import { Heading3, Text } from "@/components/ui/Typography";

function InfoRow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={icon} alt="" width={24} height={24} className="size-6 shrink-0" />
      <Text className="whitespace-nowrap">{children}</Text>
    </div>
  );
}

function CapacityBar({
  attendeeCount,
  capacity,
}: {
  attendeeCount: number;
  capacity: number;
}) {
  const percentage = Math.min(100, Math.round((attendeeCount / capacity) * 100));
  const spotsLeft = Math.max(0, capacity - attendeeCount);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Image
          src="/icon-profile.svg"
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0"
        />
        <Text className="whitespace-nowrap">Prosta mesta: {spotsLeft}</Text>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-divider">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
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
  return (
    <Box
      className={
        isNext
          ? "relative flex flex-col border-2 border-transparent shadow-[0_16px_36px_-20px_rgba(245,130,32,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-16px_rgba(245,130,32,0.55)]"
          : "relative flex flex-col transition-shadow hover:shadow-md"
      }
      style={
        isNext
          ? {
              backgroundImage:
                "linear-gradient(#fff, #FFF6EC), linear-gradient(90deg, #f58220, #ffab5c)",
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
      <Heading3>{title}</Heading3>
      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoRow icon="/icon-calendar.svg">{date}</InfoRow>
        <InfoRow icon="/icon-clock.svg">{timeRange}</InfoRow>
      </div>
      {price ? (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow icon="/icon-location.svg">{address}</InfoRow>
          <InfoRow icon="/icon-ticket.svg">{price}</InfoRow>
        </div>
      ) : (
        <div className="mt-4">
          <InfoRow icon="/icon-location.svg">{address}</InfoRow>
        </div>
      )}
      {capacity !== undefined && attendeeCount !== undefined ? (
        <div className="mt-6">
          <CapacityBar attendeeCount={attendeeCount} capacity={capacity} />
        </div>
      ) : null}
      <ButtonLink href={href} variant="secondary" className="mt-6 self-start">
        {t("reserve")}
      </ButtonLink>
    </Box>
  );
}
