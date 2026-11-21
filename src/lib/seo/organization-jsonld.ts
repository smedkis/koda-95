import { RECIPIENT_NAME } from "@/lib/payment-info";
import { getSiteUrl } from "@/lib/site-url";

// Koda 95 is a product of Tahografi Cuderman d.o.o., whose main site is
// www.tahograficuderman.si. Pointing the business's `url`/`@id` at that site
// (not at this koda95 subdomain) lets Google tie these pages to the same
// entity as the main site and the company's Google Business profile.
// Contact details and opening hours mirror the main site's footer — keep them
// in sync if those change there.
const COMPANY_URL = "https://www.tahograficuderman.si";
export const ORGANIZATION_ID = `${COMPANY_URL}/#organization`;

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function buildOrganizationJsonLd() {
  return {
    "@type": "LocalBusiness",
    "@id": ORGANIZATION_ID,
    name: RECIPIENT_NAME,
    url: COMPANY_URL,
    logo: `${getSiteUrl()}/logo.png`,
    image: `${getSiteUrl()}/about.webp`,
    telephone: "+386 51 672 315",
    email: "info@tahograficuderman.si",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Pot za krajem 35",
      postalCode: "4000",
      addressLocality: "Kranj",
      addressCountry: "SI",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: WEEKDAYS,
        opens: "07:00",
        closes: "16:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "12:00",
      },
    ],
  };
}

// One program landing page = one schema.org Course offered by the company.
// The business node rides along in the same @graph so the `provider`
// reference resolves on the page itself.
export function buildProgramJsonLd({
  name,
  description,
  url,
  locale,
}: {
  name: string;
  description: string;
  url: string;
  locale: string;
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(),
      {
        "@type": "Course",
        name,
        description,
        url,
        inLanguage: locale,
        provider: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}
