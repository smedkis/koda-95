import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";

// Canonical + hreflang alternates for a route shared across all 3 locales.
// `href` uses next-intl's un-prefixed pathname shape (e.g.
// "/redno-usposabljanje/usposabljanje-2026-08-26") — getPathname applies
// each locale's actual prefixing rule (sl is unprefixed, en/sr are not).
export function buildAlternates(href: string, currentLocale: string) {
  const siteUrl = getSiteUrl();
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${siteUrl}${getPathname({ href, locale })}`;
  }
  languages["x-default"] = `${siteUrl}${getPathname({ href, locale: routing.defaultLocale })}`;

  return {
    canonical: `${siteUrl}${getPathname({ href, locale: currentLocale })}`,
    languages,
  };
}
