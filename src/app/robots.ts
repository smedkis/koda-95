import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

// Admin/login/API are kept out of the crawl entirely (disallow). Public
// pages we don't want indexed (obrazec/potrjeno confirmation pages) already
// carry their own `robots: { index: false }` metadata instead of being
// disallowed here — combining both on the same page is a known way to end
// up with an unhelpful "no information available" search result, since a
// disallowed page's own noindex tag is never seen by the crawler.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/prijava"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
