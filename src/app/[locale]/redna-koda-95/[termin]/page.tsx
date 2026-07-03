import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ColumnGuides } from "@/components/site/ColumnGuides";
import { FaqSection } from "@/components/site/FaqSection";
import { Footer } from "@/components/site/Footer";
import { SectionDivider } from "@/components/site/SectionDivider";
import { SubscriptionSection } from "@/components/site/SubscriptionSection";
import { TerminDetails } from "@/components/site/TerminDetails";
import { TerminRegistrationForm } from "@/components/site/TerminRegistrationForm";
import { TERMIN_FAQ } from "@/lib/termin-faq";

// Placeholder data — will be replaced with a real Supabase query keyed by
// the [termin] slug.
const PLACEHOLDER_TERMIN = {
  title: "Redno usposabljanje Koda 95 (2026)",
  description:
    "Redno usposabljanje za podaljšanje kode 95 po predpisanem programu za leto 2026. Usposabljanje traja 7 ur in je namenjeno vsem poklicnim voznikom kategorij C in D, ki morajo podaljšati veljavnost temeljne kvalifikacije.",
  price: "50 EUR z DDV",
  spotsLabel: "16/24 prostih mest",
  date: "Sreda, 20.05. 2026",
  timeRange: "15.00 - 21.00",
  address: "Pot za krajem 35, 4000 Kranj",
};

export const metadata: Metadata = {
  title: `${PLACEHOLDER_TERMIN.title} | Tahografi Cuderman`,
  description: PLACEHOLDER_TERMIN.description,
};

export default async function TerminPage() {
  const t = await getTranslations("Programs.redna");
  return (
    <Container>
      <div className="relative">
        <ColumnGuides />
        <div className="relative z-10 pt-32">
          <div className="grid grid-cols-5 gap-24 pb-32">
            <div className="col-span-2 min-w-0">
              <TerminDetails
                programLabel={t("name")}
                programHref="/redna-koda-95"
                title={PLACEHOLDER_TERMIN.title}
                description={PLACEHOLDER_TERMIN.description}
                price={PLACEHOLDER_TERMIN.price}
                spotsLabel={PLACEHOLDER_TERMIN.spotsLabel}
                date={PLACEHOLDER_TERMIN.date}
                timeRange={PLACEHOLDER_TERMIN.timeRange}
                address={PLACEHOLDER_TERMIN.address}
              />
            </div>
            <div className="col-span-3">
              <TerminRegistrationForm />
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
