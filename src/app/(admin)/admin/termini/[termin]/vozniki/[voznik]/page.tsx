import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminVoznikEditContent } from "@/components/admin/AdminVoznikEditContent";
import { Heading2, Text } from "@/components/ui/Typography";
import { getTerminBySlug, listTermini } from "@/lib/data/termini";
import { getRegistration } from "@/lib/data/registrations";

export const dynamic = "force-dynamic";

export default async function UrediVoznikPage({
  params,
}: {
  params: Promise<{ termin: string; voznik: string }>;
}) {
  const { termin: terminId, voznik: voznikId } = await params;
  const termin = await getTerminBySlug(terminId);
  const driver = termin ? await getRegistration(terminId, voznikId) : null;
  const cleanTerminTitle = termin?.title.replace(/\s*\([^)]*\)\s*$/, "") ?? "Termin";
  const { upcoming } = await listTermini();
  const otherTermini = upcoming
    .filter((t) => t.id !== terminId)
    .map((t) => ({
      slug: t.id,
      label: `${t.title.replace(/\s*\([^)]*\)\s*$/, "")} — ${t.date}`,
    }));

  if (!driver) {
    return (
      <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
        <AdminBreadcrumbs
          items={[
            { label: "Termini", href: "/admin/termini" },
            { label: cleanTerminTitle, href: `/admin/termini/${terminId}` },
          ]}
        />
        <Heading2>Voznik ne obstaja</Heading2>
        <Text className="mt-4">Voznika s to povezavo ni bilo mogoče najti.</Text>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-24 lg:mt-20 lg:mb-32">
      <AdminBreadcrumbs
        items={[
          { label: "Termini", href: "/admin/termini" },
          { label: cleanTerminTitle, href: `/admin/termini/${terminId}` },
          { label: driver.driverName },
        ]}
      />
      <Heading2>{driver.driverName}</Heading2>
      <AdminVoznikEditContent
        terminId={terminId}
        initialDriver={driver}
        otherTermini={otherTermini}
      />
    </div>
  );
}
