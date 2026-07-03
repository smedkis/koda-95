import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Eyebrow, Heading2, Text } from "@/components/ui/Typography";

function DetailRow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={icon} alt="" width={24} height={24} className="size-6 shrink-0" />
      <Text className="whitespace-nowrap">{children}</Text>
    </div>
  );
}

export function TerminDetails({
  programLabel,
  programHref,
  title,
  description,
  price,
  spotsLabel,
  date,
  timeRange,
  address,
}: {
  programLabel: string;
  programHref: string;
  title: string;
  description: string;
  price?: string;
  spotsLabel: string;
  date: string;
  timeRange: string;
  address: string;
}) {
  const t = useTranslations("TerminDetails");
  return (
    <div>
      <Breadcrumbs
        items={[
          { label: programLabel, href: programHref },
          { label: title },
        ]}
      />
      <Heading2 className="mt-6">{title}</Heading2>
      <Text className="mt-4">{description}</Text>
      <Eyebrow className="mt-8">{t("detailsHeading")}</Eyebrow>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {price ? (
          <>
            <div className="flex flex-col gap-2">
              <DetailRow icon="/icon-ticket.svg">{price}</DetailRow>
              <DetailRow icon="/icon-profile.svg">{spotsLabel}</DetailRow>
            </div>
            <div className="flex flex-col gap-2">
              <DetailRow icon="/icon-calendar.svg">{date}</DetailRow>
              <DetailRow icon="/icon-clock.svg">{timeRange}</DetailRow>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <DetailRow icon="/icon-profile.svg">{spotsLabel}</DetailRow>
              <DetailRow icon="/icon-calendar.svg">{date}</DetailRow>
            </div>
            <div className="flex flex-col gap-2">
              <DetailRow icon="/icon-clock.svg">{timeRange}</DetailRow>
            </div>
          </>
        )}
      </div>
      <Eyebrow className="mt-6">{t("location")}</Eyebrow>
      <div className="mt-4">
        <DetailRow icon="/icon-location.svg">{address}</DetailRow>
      </div>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-divider">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          className="h-full w-full border-0"
          loading="lazy"
          title={t("mapTitle")}
        />
      </div>
    </div>
  );
}
