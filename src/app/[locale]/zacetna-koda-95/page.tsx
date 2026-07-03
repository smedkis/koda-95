import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AboutSection } from "@/components/site/AboutSection";
import { FaqSection } from "@/components/site/FaqSection";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { LogosSection } from "@/components/site/LogosSection";
import { NumbersSection } from "@/components/site/NumbersSection";
import { SectionDivider } from "@/components/site/SectionDivider";
import { SubscriptionSection } from "@/components/site/SubscriptionSection";
import { TerminiSection } from "@/components/site/TerminiSection";

// Placeholder data — will be replaced with a real Supabase query.
const PLACEHOLDER_TERMINI = [
  {
    title: "Začetno usposabljanje Koda 95",
    date: "Ponedeljek, 08.06. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "08.00 - 16.00",
    attendeeCount: 12,
    capacity: 20,
    href: "/zacetna-koda-95/usposabljanje-2026-06-08",
  },
  {
    title: "Začetno usposabljanje Koda 95",
    date: "Ponedeljek, 13.07. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "08.00 - 16.00",
    attendeeCount: 5,
    capacity: 20,
    href: "/zacetna-koda-95/usposabljanje-2026-07-13",
  },
  {
    title: "Začetno usposabljanje Koda 95",
    date: "Ponedeljek, 10.08. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "08.00 - 16.00",
    attendeeCount: 18,
    capacity: 20,
    href: "/zacetna-koda-95/usposabljanje-2026-08-10",
  },
  {
    title: "Začetno usposabljanje Koda 95",
    date: "Ponedeljek, 14.09. 2026",
    address: "Pot za krajem 35, 4000 Kranj",
    timeRange: "08.00 - 16.00",
    attendeeCount: 2,
    capacity: 20,
    href: "/zacetna-koda-95/usposabljanje-2026-09-14",
  },
];

// Placeholder questions — real content to follow later.
const PLACEHOLDER_FAQ = [
  {
    question: "Kdo mora opraviti začetno usposabljanje Koda 95?",
    answer:
      "Vsak nov poklicni voznik s kategorijo C ali D, ki še nima temeljne kvalifikacije (TKV), mora opraviti začetno usposabljanje Koda 95.",
  },
  {
    question: "Koliko časa traja začetno usposabljanje?",
    answer:
      "Začetno usposabljanje je obsežnejše od rednega in traja več dni, odvisno od izbranega programa.",
  },
  {
    question: "Kaj potrebujem za prijavo na termin?",
    answer:
      "Za prijavo potrebujete osebne podatke, veljavno vozniško dovoljenje ustrezne kategorije in podatke za plačilo.",
  },
  {
    question: "Ali lahko usposabljanje plača podjetje namesto mene?",
    answer:
      "Da, pri prijavi lahko izberete, da plačilo izvede podjetje, in vnesete njegove podatke.",
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Programs.zacetna");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ZacetnaKoda95Page() {
  const t = await getTranslations("Programs.zacetna");
  const tHome = await getTranslations("TerminDetails");
  return (
    <Container>
      <Hero
        breadcrumbs={[
          { label: tHome("home"), href: "https://tahograficuderman.si", external: true },
          { label: t("breadcrumb") },
        ]}
        title={t("heroTitle")}
        description={t("heroDescription")}
      />
      <TerminiSection termini={PLACEHOLDER_TERMINI} />
      <LogosSection />
      <SectionDivider />
      <FaqSection faqs={PLACEHOLDER_FAQ} />
      <AboutSection />
      <NumbersSection />
      <SubscriptionSection />
      <Footer />
    </Container>
  );
}
