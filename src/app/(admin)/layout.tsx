import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
