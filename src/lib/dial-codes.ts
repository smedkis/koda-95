import { countries, type TCountryCode } from "countries-list";

// Same "common" countries as the country-of-birth/citizenship pickers
// (src/lib/countries.ts), shown first since that's where most of our
// drivers are from — everyone else follows alphabetically (English names,
// same source data used industry-wide for this kind of picker).
const PRIORITY_ISO: TCountryCode[] = ["SI", "BA", "RS", "HR", "MK", "XK", "ME", "UA", "AL", "BG"];

export type DialCodeOption = { code: string; name: string; iso: string };

type Entry = [TCountryCode, (typeof countries)[TCountryCode]];

// Kosovo has no single ITU-assigned code of its own historically — numbers
// route through Monaco/Serbia/Slovenia depending on operator, which is why
// the package lists 377 (Monaco) first. +383 is the code actually assigned
// to and expected for Kosovo since 2016.
const PHONE_OVERRIDES: Partial<Record<TCountryCode, number>> = { XK: 383 };

function toOption([iso, country]: Entry): DialCodeOption {
  return {
    code: `+${PHONE_OVERRIDES[iso] ?? country.phone[0]}`,
    name: country.name,
    iso: iso.toLowerCase(),
  };
}

const entries = Object.entries(countries) as Entry[];

const priorityEntries = PRIORITY_ISO.map((iso) => entries.find(([code]) => code === iso)).filter(
  (entry): entry is Entry => entry !== undefined,
);

const restEntries = entries
  .filter(([iso]) => !PRIORITY_ISO.includes(iso))
  .sort((a, b) => a[1].name.localeCompare(b[1].name));

export const DIAL_CODE_OPTIONS: DialCodeOption[] = [
  ...priorityEntries.map(toOption),
  ...restEntries.map(toOption),
];
