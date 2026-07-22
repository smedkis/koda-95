import "server-only";

const VIES_ENDPOINT = "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number";

type ViesResponse = {
  valid: boolean;
  // "name" is the actual registered company name for a plain lookup like
  // ours — "traderName" is a separate field only populated when the request
  // also includes requesterMemberStateCode/requesterNumber (an EU business
  // verifying ITS OWN counterpart's details), which we never send, so it's
  // always "---" here.
  name?: string | null;
};

// Looks up a Slovenian company by its davčna številka via the EU's official
// VIES VAT-validation service (free, no API key) — used by the /obrazec
// payment step's "Išči" button to auto-fill the company name.
export async function lookupCompanyByTaxNumber(
  taxNumber: string,
): Promise<{ name: string } | { error: string }> {
  const vatNumber = taxNumber.replace(/\D/g, "");
  if (!vatNumber) return { error: "Vnesite davčno številko." };

  let response: Response;
  try {
    response = await fetch(VIES_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode: "SI", vatNumber }),
    });
  } catch {
    return { error: "Iskanje trenutno ni na voljo. Poskusite znova ali vnesite ročno." };
  }

  if (!response.ok) {
    return { error: "Iskanje trenutno ni na voljo. Poskusite znova ali vnesite ročno." };
  }

  const data = (await response.json()) as ViesResponse;
  // Some member states don't share company details over VIES even for a
  // valid VAT number — comes back as "---" rather than omitted.
  if (!data.valid || !data.name || data.name === "---") {
    return { error: "Podjetja s to davčno številko ni bilo mogoče najti." };
  }

  return { name: data.name };
}
