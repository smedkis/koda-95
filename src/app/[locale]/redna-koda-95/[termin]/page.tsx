import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ColumnGuides } from "@/components/site/ColumnGuides";
import { FaqSection } from "@/components/site/FaqSection";
import { Footer } from "@/components/site/Footer";
import { MobileStickyReserve } from "@/components/site/MobileStickyReserve";
import { SectionDivider } from "@/components/site/SectionDivider";
import { SubscriptionSection } from "@/components/site/SubscriptionSection";
import { TerminDetails } from "@/components/site/TerminDetails";
import { TerminRegistrationForm } from "@/components/site/TerminRegistrationForm";
import { getDaysUntil, isNextTermin } from "@/lib/termin-dates";
import { TERMIN_FAQ } from "@/lib/termin-faq";
import { PLACEHOLDER_TERMINI } from "../page";

// Description text isn't part of the listing card data, so it's kept here
// and merged with the matching PLACEHOLDER_TERMINI entry by slug.
const DESCRIPTION =
  "Redno usposabljanje za podaljšanje kode 95 po predpisanem programu za leto 2026. Usposabljanje traja 7 ur in je namenjeno vsem poklicnim voznikom kategorij C in D, ki morajo podaljšati veljavnost temeljne kvalifikacije.";

function getTermin(slug: string) {
  const termin = PLACEHOLDER_TERMINI.find((entry) => entry.href.endsWith(slug));
  if (!termin) return null;
  return {
    ...termin,
    description: DESCRIPTION,
    spotsLabel: `${termin.attendeeCount}/${termin.capacity} prostih mest`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ termin: string }>;
}): Promise<Metadata> {
  const { termin: slug } = await params;
  const termin = getTermin(slug);
  if (!termin) return {};
  return {
    title: `${termin.title} | Tahografi Cuderman`,
    description: termin.description,
  };
}

export default async function TerminPage({
  params,
}: {
  params: Promise<{ termin: string }>;
}) {
  const { termin: slug } = await params;
  const termin = getTermin(slug);
  if (!termin) notFound();

  const isNext = isNextTermin(
    termin.dateISO,
    PLACEHOLDER_TERMINI.map((entry) => entry.dateISO),
  );
  const daysUntil = isNext ? getDaysUntil(termin.dateISO) : undefined;
  const t = await getTranslations("TerminRegistrationForm");
  return (
    <Container>
      <div className="relative">
        <ColumnGuides />
        <div className="relative z-10 pt-24 lg:pt-32">
          <div className="grid grid-cols-1 gap-16 pb-32 lg:grid-cols-5 lg:gap-24">
            <div className="min-w-0 lg:col-span-2">
              <TerminDetails
                programHref="/redna-koda-95"
                title={termin.title}
                description={termin.description}
                price={termin.price}
                spotsLabel={termin.spotsLabel}
                date={termin.date}
                timeRange={termin.timeRange}
                address={termin.address}
              />
            </div>
            <div className="lg:col-span-3">
              <TerminRegistrationForm daysUntil={daysUntil} />
            </div>
          </div>
          <SectionDivider />
          <FaqSection faqs={TERMIN_FAQ} />
          <SubscriptionSection />
        </div>
      </div>
      <Footer />
      <MobileStickyReserve targetId="termin-registration-form" label={t("submit")} />
    </Container>
  );
}
