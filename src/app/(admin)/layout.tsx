import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/ui/Container";
import { montserrat, sourceSans } from "@/fonts";
import { OBVESCANJE_SEEN_COOKIE } from "@/lib/obvescanje-seen";
import { countNewRegistrationsSince } from "@/lib/data/registrations";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin — Koda 95",
  description: "Administracija — Koda 95",
};

export default async function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const seenAt = cookieStore.get(OBVESCANJE_SEEN_COOKIE)?.value ?? null;
  const newRegistrationsCount = await countNewRegistrationsSince(seenAt);

  return (
    <html
      lang="sl"
      className={`${montserrat.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Container className="flex flex-1 flex-col bg-secondary-bg">
          <AdminNav newRegistrationsCount={newRegistrationsCount} />
          <div className="flex flex-1 flex-col">{children}</div>
          <AdminFooter />
        </Container>
      </body>
    </html>
  );
}
