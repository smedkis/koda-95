import type { Metadata } from "next";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/ui/Container";
import { montserrat, sourceSans } from "@/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin — Koda 95",
  description: "Administracija — Koda 95",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sl"
      className={`${montserrat.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Container className="flex flex-1 flex-col bg-secondary-bg">
          <AdminNav />
          <div className="flex flex-1 flex-col">{children}</div>
          <AdminFooter />
        </Container>
      </body>
    </html>
  );
}
