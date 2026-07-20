import type { Metadata } from "next";
import { montserrat, sourceSans } from "@/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Odjava | Koda 95",
  robots: { index: false, follow: false },
};

// Its own root layout (not under [locale] or (admin)) since this is a public
// link clicked straight from an email — no locale prefixing needed, it's
// only ever sent in Slovenian, same as the rest of the bulk-notification
// feature.
export default function OdjavaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sl"
      className={`${montserrat.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen items-center justify-center bg-secondary-bg px-4">
        {children}
      </body>
    </html>
  );
}
