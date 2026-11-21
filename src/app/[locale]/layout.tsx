import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/Nav";
import { montserrat, sourceSans } from "@/fonts";
import { routing } from "@/i18n/routing";
import { ogImagePath, ogImages, ogLocale } from "@/lib/seo/og-image";
import { getSiteUrl } from "@/lib/site-url";
import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fafafa",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("RootMeta");
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Koda 95 — Tahografi Cuderman",
      locale: ogLocale(locale),
      type: "website",
      images: ogImages(title, locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImagePath(locale)],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <Nav />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
