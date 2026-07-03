import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Heading3, Text } from "@/components/ui/Typography";
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
  title: string;
  date: string;
  address: string;
  timeRange: string;
  attendeeCount: number;
  capacity: number;
  registeredCount: number;
  formsCompletedCount: number;
  paidCount: number;
  isPast?: boolean;
};

export function AdminTerminCard({
  id,
  title,
  date,
  address,
  timeRange,
  attendeeCount,
  capacity,
  registeredCount,
  formsCompletedCount,
  paidCount,
  isPast = false,
}: AdminTerminCardProps) {
  return (
    <Box className="flex flex-col bg-white">
      <div className="flex items-start justify-between gap-4">
        <Heading3>{title}</Heading3>
        {isPast ? (
          <span className="shrink-0 rounded bg-[#FFF4CC] px-2 py-1 font-body text-[12px] font-semibold uppercase text-[#8A6800]">
            Pretekli
          </span>
        ) : null}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-[auto_auto] sm:justify-start">
        <div className="flex flex-col gap-2">
          <InfoRow icon="/icon-calendar.svg">{date}</InfoRow>
          <InfoRow icon="/icon-location.svg">{address}</InfoRow>
        </div>
        <div className="flex flex-col gap-2">
          <InfoRow icon="/icon-clock.svg">{timeRange}</InfoRow>
          <InfoRow icon="/icon-profile.svg">
            {attendeeCount}/{capacity}
          </InfoRow>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4 border-t border-divider pt-6">
        <StatRow label="Prijavljeni" value={`${registeredCount}/${capacity}`} />
        <StatRow label="Izpolnjeni obrazci" value={`${formsCompletedCount}/${registeredCount}`} />
        <StatRow label="Plačano" value={`${paidCount}/${registeredCount}`} />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Link
          href={`/admin/termini/${id}`}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded bg-secondary px-[14px] py-[10px] font-body text-[16px] font-medium text-paragraph transition-colors hover:bg-black hover:text-white",
          )}
        >
          Odpri
        </Link>
        <Button
          type="button"
          variant="secondary"
          className="flex-1 justify-center border border-[#C5C5C5] bg-[#F0F0F0] text-paragraph hover:bg-[#C5C5C5] hover:text-paragraph"
        >
          Uredi
        </Button>
      </div>
    </Box>
  );
}
