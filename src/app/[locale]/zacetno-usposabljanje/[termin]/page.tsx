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
import {
  buildTerminTitle,
  formatPriceEur,
  formatSlovenianDate,
  formatTimeRange,
} from "@/lib/termini-format";
import {
  countsByTermin,
  getPublicTermin,
  listPublicTermini,
  parsePublicTerminSlug,
} from "@/lib/data/termini";
import { buildAlternates } from "@/lib/seo/alternates";
import { ogImagePath, ogImages, ogLocale } from "@/lib/seo/og-image";
import { buildTerminJsonLd } from "@/lib/seo/termin-jsonld";

const PROGRAM = "zacetna-koda-95" as const;

async function getTermin(slug: string, locale: string) {
  const dateISO = parsePublicTerminSlug(slug);
  if (!dateISO) return null;
  const row = await getPublicTermin(PROGRAM, dateISO);
  if (!row) return null;

  const counts = await countsByTermin([row.id]);
  const registered = counts.get(row.id)?.registered ?? 0;
  const hasCapacity = row.capacity !== null;
  const td = await getTranslations({ locale, namespace: "TerminDetails" });
  const pt = await getTranslations({ locale, namespace: "Programs.zacetna" });
  const seo = await getTranslations({ locale, namespace: "Seo" });

  const date = formatSlovenianDate(row.date, locale);
  const address = row.address ?? undefined;

  return {
    title: buildTerminTitle("zacetna", row.modul, locale),
    description: pt("terminDescription"),
    metaDescription: `${pt("terminDescription")} ${seo("terminMetaSuffix", { date, location: address ?? td("byArrangement") })}`,
    price: formatPriceEur(row.price_eur, "zacetna", locale),
    spotsLabel: hasCapacity
      ? td("spotsLeft", { count: Math.max(0, (row.capacity as number) - registered) })
      : td("unlimitedSpots"),
    date,
    dateISO: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    priceEur: row.price_eur,
    timeRange: formatTimeRange(row.start_time, row.end_time),
    address,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ termin: string; locale: string }>;
}): Promise<Metadata> {
  const { termin: slug, locale } = await params;
  const termin = await getTermin(slug, locale);
  if (!termin) return {};
  const title = `${termin.title} — ${termin.date} | Tahografi Cuderman`;
  const alternates = buildAlternates(`/zacetno-usposabljanje/${slug}`, locale);
  return {
    title,
    description: termin.metaDescription,
    alternates,
    openGraph: {
      title,
      description: termin.metaDescription,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(locale),
      images: ogImages(title, locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: termin.metaDescription,
      images: [ogImagePath(locale)],
    },
  };
}

export default async function TerminPage({
  params,
  searchParams,
}: {
  params: Promise<{ termin: string; locale: string }>;
  searchParams: Promise<{ vir?: string }>;
}) {
  const { termin: slug, locale } = await params;
  const { vir } = await searchParams;
  const termin = await getTermin(slug, locale);
  if (!termin) notFound();

  const allUpcoming = await listPublicTermini(PROGRAM, locale);
  const isNext = isNextTermin(
    termin.dateISO,
    allUpcoming.map((entry) => entry.dateISO),
  );
  const daysUntil = isNext ? getDaysUntil(termin.dateISO) : undefined;
  const t = await getTranslations("TerminRegistrationForm");
  const alternates = buildAlternates(`/zacetno-usposabljanje/${slug}`, locale);
  const jsonLd = buildTerminJsonLd({
    title: termin.title,
    description: termin.metaDescription,
    dateISO: termin.dateISO,
    startTime: termin.startTime,
    endTime: termin.endTime,
    address: termin.address,
    priceEur: termin.priceEur,
    url: alternates.canonical,
  });
  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative">
        <ColumnGuides />
        <div className="relative z-10 pt-24 lg:pt-32">
          <div className="grid grid-cols-1 gap-16 pb-32 lg:grid-cols-5 lg:gap-24">
            <div className="min-w-0 lg:col-span-2">
              <TerminDetails
                programHref="/zacetno-usposabljanje"
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
              <TerminRegistrationForm
                daysUntil={daysUntil}
                program={PROGRAM}
                dateISO={termin.dateISO}
                terminPath={`/zacetno-usposabljanje/${slug}`}
                source={vir}
              />
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
