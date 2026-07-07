import type { Metadata } from "next";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminTerminDetailContent } from "@/components/admin/AdminTerminDetailContent";
import { PLACEHOLDER_PAST_TERMINI, PLACEHOLDER_TERMINI } from "@/lib/admin-termini-data";

function getTermin(id: string) {
  return (
    PLACEHOLDER_TERMINI.find((entry) => entry.id === id) ??
    PLACEHOLDER_PAST_TERMINI.find((entry) => entry.id === id) ??
    null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ termin: string }>;
}): Promise<Metadata> {
  const { termin: id } = await params;
  const termin = getTermin(id);
  if (!termin) return {};
  return {
    title: `${termin.title} | Koda 95 Admin`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminTerminDetailPage({
  params,
}: {
  params: Promise<{ termin: string }>;
}) {
  const { termin: id } = await params;
  const termin = getTermin(id);

  return (
    <div className="mt-24 mb-24 lg:mt-32 lg:mb-32">
      <AdminBackLink href="/admin/termini" label="Termini" />
      <AdminTerminDetailContent id={id} baseTermin={termin} />
    </div>
  );
}
