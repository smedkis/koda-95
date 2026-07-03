import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ConfirmationDetails } from "@/components/site/ConfirmationDetails";
import { ConfirmationHeader } from "@/components/site/ConfirmationHeader";
import { ConfirmationHelp } from "@/components/site/ConfirmationHelp";
import { ConfirmationSummary } from "@/components/site/ConfirmationSummary";
import { Footer } from "@/components/site/Footer";
import { SectionDivider } from "@/components/site/SectionDivider";

// Placeholder data — will be replaced with a real Supabase query keyed by
// the prijava= registration code.
const PLACEHOLDER_PRIJAVA = {
  driver: "Janez Novak",
  termin: "Začetno usposabljanje Koda 95",
  time: "08.00 - 16.00",
  price: "Cena bo znana naknadno",
  registrationCode: "TC-2848",
  location: "Pot za krajem 35, 4000 Kranj",
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Confirmation");
  return {
    title: `${t("pageTitle")} | Tahografi Cuderman`,
    robots: { index: false, follow: false },
  };
}

export default function PotrjenoPage() {
  return (
    <Container>
      <ConfirmationHeader />
      <ConfirmationSummary />
      <ConfirmationDetails {...PLACEHOLDER_PRIJAVA} />
      <ConfirmationHelp />
      <div className="mt-32">
        <SectionDivider />
        <Footer />
      </div>
    </Container>
  );
}
