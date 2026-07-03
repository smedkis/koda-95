import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ColumnGuides } from "@/components/site/ColumnGuides";
import { FaqSection } from "@/components/site/FaqSection";
import { Footer } from "@/components/site/Footer";
import { SectionDivider } from "@/components/site/SectionDivider";
import { SubscriptionSection } from "@/components/site/SubscriptionSection";
import { TerminDetails } from "@/components/site/TerminDetails";
import { TerminRegistrationForm } from "@/components/site/TerminRegistrationForm";
import { getDaysUntil, isNextTermin } from "@/lib/termin-dates";
import { TERMIN_FAQ } from "@/lib/termin-faq";
import { PLACEHOLDER_TERMINI } from "../page";

// Description text isn't part of the listing card data, so it's kept here
// and merged with the matching PLACEHOLDER_TERMINI entry by slug. No price
// since Začetna Koda 95 has no fixed price, and spots are unlimited.
const DESCRIPTION =
  "Začetno usposabljanje za pridobitev temeljne kvalifikacije voznika (TKV) po predpisanem programu. Namenjeno je novim poklicnim voznikom kategorij C in D, ki še nimajo veljavne kode 95.";

function getTermin(slug: string) {
  const termin = PLACEHOLDER_TERMINI.find((entry) => entry.href.endsWith(slug));
  if (!termin) return null;
  return {
    ...termin,
    description: DESCRIPTION,
    spotsLabel: "Neomejeno prostih mest",
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

  const t = await getTranslations("Programs.zacetna");
  const isNext = isNextTermin(
    termin.dateISO,
    PLACEHOLDER_TERMINI.map((entry) => entry.dateISO),
  );
  const daysUntil = isNext ? getDaysUntil(termin.dateISO) : undefined;
  return (
    <Container>
      <div className="relative">
        <ColumnGuides />
        <div className="relative z-10 pt-32">
          <div className="grid grid-cols-5 gap-24 pb-32">
            <div className="col-span-2 min-w-0">
              <TerminDetails
                programLabel={t("name")}
                programHref="/zacetna-koda-95"
                title={termin.title}
                description={termin.description}
                spotsLabel={termin.spotsLabel}
                date={termin.date}
                timeRange={termin.timeRange}
                address={termin.address}
              />
            </div>
            <div className="col-span-3">
              <TerminRegistrationForm daysUntil={daysUntil} />
            </div>
          </div>
          <SectionDivider />
          <FaqSection faqs={TERMIN_FAQ} />
          <SubscriptionSection />
        </div>
      </div>
      <Footer />
    </Container>
  );
}
