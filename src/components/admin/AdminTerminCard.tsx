import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Box } from "@/components/ui/Box";
import { Eyebrow, Heading3, Text } from "@/components/ui/Typography";
import { parseModul } from "@/lib/termini-format";
import { cn } from "@/lib/cn";

function InfoRow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={icon} alt="" width={24} height={24} className="size-6 shrink-0" />
      <Text className="whitespace-nowrap">{children}</Text>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <Eyebrow>{label}</Eyebrow>
      <Text>{value}</Text>
    </div>
  );
}

export type AdminTerminCardProps = {
  id: string;
  program: "redna" | "zacetna";
  title: string;
  date: string;
  address?: string;
  timeRange?: string;
  price?: string;
  attendeeCount?: number;
  capacity?: number;
  registeredCount: number;
  formsCompletedCount: number;
  paidCount: number;
  isPast?: boolean;
  showActions?: boolean;
};

export function AdminTerminCard({
  id,
  program,
  title,
  date,
  address,
  timeRange,
  price,
  attendeeCount,
  capacity,
  registeredCount,
  formsCompletedCount,
  paidCount,
  isPast = false,
  showActions = true,
}: AdminTerminCardProps) {
  const modul = program === "redna" ? parseModul(title) : undefined;
  const cleanTitle = title.replace(/\s*\([^)]*\)\s*$/, "");
  const hasCapacity = capacity !== undefined && attendeeCount !== undefined;
  return (
    <Box className="flex flex-col bg-white">
      <div className="flex items-start justify-between gap-4">
        <Heading3>{cleanTitle}</Heading3>
        {isPast ? (
          <span className="shrink-0 rounded bg-[#FFF4CC] px-2 py-1 font-body text-[12px] font-semibold uppercase text-[#8A6800]">
            Pretekli
          </span>
        ) : null}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {modul ? <InfoRow icon="/Category.svg">Modul {modul}</InfoRow> : null}
        {price ? <InfoRow icon="/icon-ticket.svg">{price}</InfoRow> : null}
        <InfoRow icon="/icon-calendar.svg">{date}</InfoRow>
        <InfoRow icon="/icon-clock.svg">{timeRange ?? "Po dogovoru"}</InfoRow>
        <InfoRow icon="/icon-location.svg">{address ?? "Po dogovoru"}</InfoRow>
        {hasCapacity ? (
          <InfoRow icon="/icon-profile.svg">
            {attendeeCount}/{capacity}
          </InfoRow>
        ) : (
          <InfoRow icon="/icon-profile.svg">Neomejeno prostih mest</InfoRow>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-4 border-t border-divider pt-6">
        <StatRow
          label="Prijavljeni"
          value={hasCapacity ? `${registeredCount}/${capacity}` : `${registeredCount}`}
        />
        <StatRow label="Izpolnjeni obrazci" value={`${formsCompletedCount}/${registeredCount}`} />
        <StatRow label="Plačano" value={`${paidCount}/${registeredCount}`} />
      </div>
      {showActions ? (
        <Link
          href={`/admin/termini/${id}`}
          className={cn(
            "mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-secondary px-[14px] py-[10px] font-body text-[16px] font-medium text-paragraph transition-colors hover:bg-[#5de0c0]",
          )}
        >
          Odpri
        </Link>
      ) : null}
    </Box>
  );
}
