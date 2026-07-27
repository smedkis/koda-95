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
import { buildAlternates } from "@/lib/seo/alternates";
import { ogImagePath, ogImages, ogLocale } from "@/lib/seo/og-image";

const PLACEHOLDER_FAQ = [
  {
    question: "Kako pogosto moram opraviti usposabljanje Koda 95?",
    answer:
      "Redno usposabljanje Koda 95 je zakonsko obvezno vsakih 5 let za poklicne voznike s kategorijo C ali D.",
  },
  {
    question: "Kaj potrebujem za prijavo na termin?",
    answer:
      "Za prijavo potrebujete osebne podatke, veljavno vozniško dovoljenje ustrezne kategorije in podatke za plačilo.",
  },
  {
    question: "Kako poteka plačilo usposabljanja?",
    answer: "Plačilo se izvede preko UPN QR kode, ki jo prejmete po oddaji prijave.",
  },
  {
    question: "Ali lahko usposabljanje plača podjetje namesto mene?",
    answer:
      "Da, pri prijavi lahko izberete, da plačilo izvede podjetje, in vnesete njegove podatke.",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("Programs.redna");
  const title = t("metaTitle");
  const description = t("metaDescription");
  const alternates = buildAlternates("/redno-usposabljanje", locale);
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(locale),
      images: ogImages(title, locale),
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImagePath(locale)] },
  };
}

export default async function RednaKoda95Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vir?: string }>;
}) {
  const { locale } = await params;
  const { vir } = await searchParams;
  const t = await getTranslations("Programs.redna");
  const termini = await listPublicTermini("redna-koda-95", locale);
  return (
    <Container>
      <Hero
        titlePrefix={t("heroTitlePrefix")}
        titleHighlight={t("heroTitleHighlight")}
        titleSuffix={t("heroTitleSuffix")}
        description={t("heroDescription")}
        accent="primary"
      />
      <TerminiSection termini={termini} vir={vir} />
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
