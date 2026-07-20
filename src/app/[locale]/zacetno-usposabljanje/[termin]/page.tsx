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
import { buildTerminTitle, formatSlovenianDate, formatTimeRange } from "@/lib/termini-format";
import {
  getPublicTermin,
  listPublicTermini,
  parsePublicTerminSlug,
} from "@/lib/data/termini";

const PROGRAM = "zacetna-koda-95" as const;

// Description text isn't part of the listing card data, so it's kept here.
// No price since Začetna Koda 95 has no fixed price, and spots are unlimited.
const DESCRIPTION =
  "Začetno usposabljanje za pridobitev temeljne kvalifikacije voznika (TKV) po predpisanem programu. Namenjeno je novim poklicnim voznikom kategorij C in D, ki še nimajo veljavne kode 95.";

async function getTermin(slug: string) {
  const dateISO = parsePublicTerminSlug(slug);
  if (!dateISO) return null;
  const row = await getPublicTermin(PROGRAM, dateISO);
  if (!row) return null;

  return {
    title: buildTerminTitle("zacetna", row.modul),
    description: DESCRIPTION,
    spotsLabel: "Neomejeno prostih mest",
    date: formatSlovenianDate(row.date),
    dateISO: row.date,
    timeRange: formatTimeRange(row.start_time, row.end_time),
    address: row.address ?? undefined,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ termin: string }>;
}): Promise<Metadata> {
  const { termin: slug } = await params;
  const termin = await getTermin(slug);
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
  const termin = await getTermin(slug);
  if (!termin) notFound();

  const allUpcoming = await listPublicTermini(PROGRAM);
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
                programHref="/zacetno-usposabljanje"
                title={termin.title}
                description={termin.description}
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
