import { Container } from "@/components/ui/Container";
import { ColumnGuides } from "@/components/site/ColumnGuides";
import { FaqSection } from "@/components/site/FaqSection";
import { Footer } from "@/components/site/Footer";
import { SubscriptionSection } from "@/components/site/SubscriptionSection";
import { TerminDetails } from "@/components/site/TerminDetails";
import { TerminRegistrationForm } from "@/components/site/TerminRegistrationForm";
import { TERMIN_FAQ } from "@/lib/termin-faq";

// Placeholder data — will be replaced with a real Supabase query keyed by
// the [termin] slug. No price yet since Začetna Koda 95 has no fixed price.
const PLACEHOLDER_TERMIN = {
  title: "Začetno usposabljanje Koda 95",
  description:
    "Začetno usposabljanje za pridobitev temeljne kvalifikacije voznika (TKV) po predpisanem programu. Namenjeno je novim poklicnim voznikom kategorij C in D, ki še nimajo veljavne kode 95.",
  spotsLabel: "12/20 prostih mest",
  date: "Ponedeljek, 08.06. 2026",
  timeRange: "08.00 - 16.00",
  address: "Pot za krajem 35, 4000 Kranj",
};

export default function TerminPage() {
  return (
    <Container>
      <div className="relative">
        <ColumnGuides />
        <div className="relative z-10 pt-32">
          <div className="grid grid-cols-5 gap-24 pb-32">
            <div className="col-span-2 min-w-0">
              <TerminDetails
                programLabel="Začetna Koda 95"
                programHref="/zacetna-koda-95"
                title={PLACEHOLDER_TERMIN.title}
                description={PLACEHOLDER_TERMIN.description}
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
          <div className="w-screen border-b border-divider ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]" />
          <FaqSection faqs={TERMIN_FAQ} />
          <SubscriptionSection />
        </div>
      </div>
      <Footer />
    </Container>
  );
}
