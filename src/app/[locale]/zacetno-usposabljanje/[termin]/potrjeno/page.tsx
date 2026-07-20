import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmationDetails } from "@/components/site/ConfirmationDetails";
import { ConfirmationHeader } from "@/components/site/ConfirmationHeader";
import { ConfirmationHelp } from "@/components/site/ConfirmationHelp";
import { ConfirmationSummary } from "@/components/site/ConfirmationSummary";
import { Footer } from "@/components/site/Footer";
import { SectionDivider } from "@/components/site/SectionDivider";
import { getRegistrationByCode } from "@/lib/data/public-registration";
import { formatPriceEur, formatSlovenianDate } from "@/lib/termini-format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Confirmation");
  return {
    title: `${t("pageTitle")} | Tahografi Cuderman`,
    robots: { index: false, follow: false },
  };
}

export default async function PotrjenoPage({
  params,
  searchParams,
}: {
  params: Promise<{ termin: string }>;
  searchParams: Promise<{ prijava?: string }>;
}) {
  const { termin } = await params;
  const { prijava } = await searchParams;
  const registration = prijava ? await getRegistrationByCode(prijava) : null;
  if (!registration) notFound();

  const t = await getTranslations("Confirmation");
  const displayDate = formatSlovenianDate(registration.dateISO);
  const price = formatPriceEur(registration.priceEur) ?? "Cena bo znana naknadno";
  const timeRange = registration.timeRange ?? "Po dogovoru";

  return (
    <Container>
      <ConfirmationHeader />
      <ConfirmationSummary
        title={registration.terminTitle}
        date={registration.dateISO}
        timeRange={timeRange}
        location={registration.address ?? "Po dogovoru"}
      />
      <ConfirmationDetails
        driver={registration.driverName}
        termin={`${registration.terminTitle} — ${displayDate}`}
        time={timeRange}
        price={price}
        registrationCode={registration.registrationCode}
        location={registration.address}
      />
      <div className="mx-auto mt-6 max-w-[680px] print:hidden">
        <ButtonLink
          href={`/zacetno-usposabljanje/${termin}/obrazec?prijava=${registration.registrationCode}`}
          className="w-full justify-center"
        >
          {t("completeRegistration")}
        </ButtonLink>
      </div>
      <ConfirmationHelp />
      <div className="mt-24 lg:mt-32 print:mt-6">
        <SectionDivider />
        <Footer />
        <SectionDivider className="hidden print:block" />
      </div>
    </Container>
  );
}
