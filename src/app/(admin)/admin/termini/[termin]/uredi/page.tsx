import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminTerminForm } from "@/components/admin/AdminTerminForm";
import { Heading2, Text } from "@/components/ui/Typography";
import { getTerminBySlug } from "@/lib/data/termini";

export const dynamic = "force-dynamic";

export default async function UrediTerminPage({
  params,
}: {
  params: Promise<{ termin: string }>;
}) {
  const { termin: id } = await params;
  const termin = await getTerminBySlug(id);

  if (!termin) {
    return (
      <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
        <AdminBreadcrumbs items={[{ label: "Termini", href: "/admin/termini" }]} />
        <Heading2>Termin ne obstaja</Heading2>
        <Text className="mt-4">Termina s to povezavo ni bilo mogoče najti.</Text>
      </div>
    );
  }

  const cleanTitle = termin.title.replace(/\s*\([^)]*\)\s*$/, "");

  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[
          { label: "Termini", href: "/admin/termini" },
          { label: cleanTitle, href: `/admin/termini/${id}` },
          { label: "Uredi" },
        ]}
      />
      <Heading2>Uredi termin</Heading2>
      <AdminTerminForm initialTermin={termin} />
    </div>
  );
}
