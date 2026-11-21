import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/site-url";
import { listPublicTermini } from "@/lib/data/termini";

function entryFor(href: string, priority: number): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${getSiteUrl()}${getPathname({ href, locale })}`;
  }
  return {
    url: languages[routing.defaultLocale],
    changeFrequency: "weekly",
    priority,
    alternates: { languages },
  };
}

// Only upcoming termini are listed — past ones drop off listPublicTermini's
// own "today onward" filter, which is also correct for a sitemap (no point
// pointing crawlers at a session that already happened).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [redna, zacetna] = await Promise.all([
    listPublicTermini("redna-koda-95"),
    listPublicTermini("zacetna-koda-95"),
  ]);

  return [
    entryFor("/redno-usposabljanje", 0.9),
    entryFor("/zacetno-usposabljanje", 0.9),
    ...redna.map((termin) => entryFor(termin.href, 0.7)),
    ...zacetna.map((termin) => entryFor(termin.href, 0.7)),
  ];
}
