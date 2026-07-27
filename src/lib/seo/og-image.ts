// Next.js shallow-merges `openGraph`/`twitter` per route segment — a page
// that sets its own openGraph object drops the root layout's `images`
// entirely unless it redeclares them, so every page's metadata calls this
// instead of relying on inheriting the layout's default.
const OG_IMAGE_BY_LOCALE: Record<string, string> = {
  sl: "/og.png",
  en: "/og-en.png",
  sr: "/og-sr.png",
};

export function ogImagePath(locale: string): string {
  return OG_IMAGE_BY_LOCALE[locale] ?? OG_IMAGE_BY_LOCALE.sl;
}

export function ogImages(alt: string, locale: string) {
  return [{ url: ogImagePath(locale), width: 1200, height: 630, alt }];
}

// og:locale wants the full "language_TERRITORY" form (sl_SI), not the bare
// "sl" next-intl uses for routing.
const OG_LOCALES: Record<string, string> = { sl: "sl_SI", en: "en_US", sr: "sr_RS" };

export function ogLocale(locale: string): string {
  return OG_LOCALES[locale] ?? OG_LOCALES.sl;
}
