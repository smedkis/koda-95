import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Eyebrow, Heading2, Text, TextMedium } from "@/components/ui/Typography";
import { Link } from "@/i18n/navigation";

function DetailRow({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <Image src={icon} alt="" width={24} height={24} className="size-6 shrink-0" />
      <Text className="whitespace-nowrap">{children}</Text>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <path d="M5.09976 12L19.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <path
        d="M10.5498 18.0246L4.4998 12.0006L10.5498 5.97559"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function TerminDetails({
  programHref,
  title,
  description,
  price,
  spotsLabel,
  date,
  timeRange,
  address,
}: {
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
      <Link
        href={programHref}
        className="inline-flex items-center gap-1.5 text-placeholder hover:text-paragraph hover:underline"
      >
        <ArrowLeftIcon />
        <TextMedium as="span" className="text-inherit">
          {t("backToTermini")}
        </TextMedium>
      </Link>
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
            <DetailRow icon="/icon-calendar.svg">{date}</DetailRow>
            <DetailRow icon="/icon-clock.svg">{timeRange}</DetailRow>
            <div className="col-span-2">
              <DetailRow icon="/icon-profile.svg">{spotsLabel}</DetailRow>
            </div>
          </>
        )}
      </div>
      <Eyebrow className="mt-6">{t("location")}</Eyebrow>
      <div className="mt-4">
        <DetailRow icon="/icon-location.svg">{address}</DetailRow>
      </div>
      <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-divider">
        {/* The address is already shown as text above — this embed is a
            visual reference only, so pointer-events are disabled. Otherwise
            the iframe can intercept taps meant for anything rendered on top
            of it (e.g. the mobile sticky reserve bar), a known browser quirk
            that plain z-index/stacking fixes don't reliably solve. */}
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          className="pointer-events-none h-full w-full border-0"
          loading="lazy"
          title={t("mapTitle")}
        />
      </div>
    </div>
  );
}
