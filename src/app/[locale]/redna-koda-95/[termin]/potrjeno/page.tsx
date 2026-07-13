import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
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
  searchParams,
}: {
  searchParams: Promise<{ prijava?: string }>;
}) {
  const { prijava } = await searchParams;
  const registration = prijava ? await getRegistrationByCode(prijava) : null;
  if (!registration) notFound();

  const displayDate = formatSlovenianDate(registration.dateISO);
  const price = formatPriceEur(registration.priceEur) ?? "Cena bo znana naknadno";

  return (
    <Container>
      <ConfirmationHeader />
      <ConfirmationSummary
        title={registration.terminTitle}
        date={registration.dateISO}
        timeRange={registration.timeRange}
        location={registration.address}
      />
      <ConfirmationDetails
        driver={registration.driverName}
        termin={`${registration.terminTitle} — ${displayDate}`}
        time={registration.timeRange}
        price={price}
        registrationCode={registration.registrationCode}
        location={registration.address}
      />
      <ConfirmationHelp />
      <div className="mt-24 lg:mt-32 print:mt-6">
        <SectionDivider />
        <Footer />
        <SectionDivider className="hidden print:block" />
      </div>
    </Container>
  );
}
