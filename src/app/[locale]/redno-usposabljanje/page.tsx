import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { AboutSection } from "@/components/site/AboutSection";
import { FaqSection, type FaqItemData } from "@/components/site/FaqSection";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { LogosSection } from "@/components/site/LogosSection";
import { NumbersSection } from "@/components/site/NumbersSection";
import { SectionDivider } from "@/components/site/SectionDivider";
import { SubscriptionSection } from "@/components/site/SubscriptionSection";
import { TerminiSection } from "@/components/site/TerminiSection";
import { listPublicTermini } from "@/lib/data/termini";
import { buildAlternates } from "@/lib/seo/alternates";
import { buildFaqJsonLd } from "@/lib/seo/faq-jsonld";
import { buildProgramJsonLd } from "@/lib/seo/organization-jsonld";
import { ogImagePath, ogImages, ogLocale } from "@/lib/seo/og-image";

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
  const faqs = t.raw("faq") as FaqItemData[];
  const faqJsonLd = buildFaqJsonLd(faqs);
  const tNav = await getTranslations("Nav");
  const programJsonLd = buildProgramJsonLd({
    name: `${tNav("redna")} Koda 95`,
    description: t("metaDescription"),
    url: buildAlternates("/redno-usposabljanje", locale).canonical,
    locale,
  });
  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(programJsonLd) }}
      />
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
      <FaqSection faqs={faqs} />
      <SubscriptionSection />
      <Footer />
    </Container>
  );
}
