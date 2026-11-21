import { RECIPIENT_NAME } from "@/lib/payment-info";
import { ORGANIZATION_ID } from "@/lib/seo/organization-jsonld";

const ORGANIZER_ADDRESS = "Pot za krajem 35, 4000 Kranj, Slovenija";

// schema.org EducationEvent for a single termin — lets Google show date,
// price and location directly in search results instead of just a link.
// Never asserts a specific street address or price we don't actually have:
// zacetna termini with no fixed location/price omit those fields rather
// than guessing, since a wrong fact in structured data is worse than a
// missing one.
export function buildTerminJsonLd({
  title,
  description,
  dateISO,
  startTime,
  endTime,
  address,
  priceEur,
  url,
}: {
  title: string;
  description: string;
  dateISO: string;
  startTime: string | null;
  endTime: string | null;
  address?: string;
  priceEur: number | null;
  url: string;
}) {
  const startDate = startTime ? `${dateISO}T${startTime.slice(0, 5)}:00` : dateISO;
  const endDate = endTime ? `${dateISO}T${endTime.slice(0, 5)}:00` : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: title,
    description,
    startDate,
    endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: address
      ? { "@type": "Place", name: address, address }
      : { "@type": "Place", name: "Po dogovoru z organizatorjem" },
    organizer: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: RECIPIENT_NAME,
      address: ORGANIZER_ADDRESS,
      url: "https://www.tahograficuderman.si",
    },
    offers:
      priceEur !== null
        ? {
            "@type": "Offer",
            price: priceEur,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url,
          }
        : undefined,
    url,
  };
}
