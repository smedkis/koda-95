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

const PROGRAM = "redna-koda-95" as const;

// Description text isn't part of the listing card data, so it's kept here.
const DESCRIPTION =
  "Redno usposabljanje za podaljšanje kode 95 po predpisanem programu za leto 2026. Usposabljanje traja 7 ur in je namenjeno vsem poklicnim voznikom kategorij C in D, ki morajo podaljšati veljavnost temeljne kvalifikacije.";

async function getTermin(slug: string, locale: string) {
  const dateISO = parsePublicTerminSlug(slug);
  if (!dateISO) return null;
  const row = await getPublicTermin(PROGRAM, dateISO);
  if (!row) return null;

  const counts = await countsByTermin([row.id]);
  const registered = counts.get(row.id)?.registered ?? 0;
  const hasCapacity = row.capacity !== null;

  return {
    title: buildTerminTitle("redna", row.modul, locale),
    description: DESCRIPTION,
    price: formatPriceEur(row.price_eur),
    spotsLabel: hasCapacity ? `${registered}/${row.capacity} prostih mest` : "Neomejeno prostih mest",
    date: formatSlovenianDate(row.date),
    dateISO: row.date,
    timeRange: formatTimeRange(row.start_time, row.end_time),
    address: row.address ?? undefined,
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
  return {
    title: `${termin.title} | Tahografi Cuderman`,
    description: termin.description,
  };
}

export default async function TerminPage({
  params,
}: {
  params: Promise<{ termin: string; locale: string }>;
}) {
  const { termin: slug, locale } = await params;
  const termin = await getTermin(slug, locale);
  if (!termin) notFound();

  const allUpcoming = await listPublicTermini(PROGRAM, locale);
  const isNext = isNextTermin(
    termin.dateISO,
    allUpcoming.map((entry) => entry.dateISO),
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
                programHref="/redno-usposabljanje"
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
                terminPath={`/redno-usposabljanje/${slug}`}
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
