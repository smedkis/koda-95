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
import { listPublicTermini } from "@/lib/data/termini";

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
  const termini = await listPublicTermini("zacetna-koda-95");
  return (
    <Container>
      <Hero title={t("heroTitle")} description={t("heroDescription")} />
      <TerminiSection termini={termini} />
      <LogosSection />
      <SectionDivider />
      <AboutSection />
      <NumbersSection />
      <FaqSection faqs={PLACEHOLDER_FAQ} />
      <SubscriptionSection />
      <Footer />
    </Container>
  );
}
