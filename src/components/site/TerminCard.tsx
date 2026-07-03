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

export type TerminCardProps = {
  title: string;
  date: string;
  address: string;
  timeRange: string;
  attendeeCount: number;
  capacity: number;
  href: string;
};

export function TerminCard({
  title,
  date,
  address,
  timeRange,
  attendeeCount,
  capacity,
  href,
}: TerminCardProps) {
  const t = useTranslations("TerminCard");
  return (
    <Box className="flex flex-col">
      <Heading3>{title}</Heading3>
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
      <ButtonLink href={href} variant="secondary" className="mt-8 self-start">
        {t("reserve")}
      </ButtonLink>
    </Box>
  );
}
