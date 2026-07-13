import type { Metadata } from "next";
import { AdminTerminDetailContent } from "@/components/admin/AdminTerminDetailContent";
import { getTerminBySlug } from "@/lib/data/termini";
import { getRegistrationsForTermin } from "@/lib/data/registrations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ termin: string }>;
}): Promise<Metadata> {
  const { termin: id } = await params;
  const termin = await getTerminBySlug(id);
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
  const termin = await getTerminBySlug(id);
  const drivers = termin ? await getRegistrationsForTermin(id) : [];

  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminTerminDetailContent id={id} termin={termin} initialDrivers={drivers} />
    </div>
  );
}
