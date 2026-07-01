import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sl", "en", "sr"],
  defaultLocale: "sl",
  localePrefix: "as-needed",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});
