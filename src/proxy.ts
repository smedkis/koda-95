import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Search engine / social preview crawlers must always see the unprefixed
// Slovenian page at "/", never a language-detection redirect. Since Accept-Language
// is what next-intl's redirect decision is based on, we strip it for known bots
// before handing the request off, so they fall through to the default locale.
const BOT_USER_AGENT = /bot|crawl|spider|slurp|facebookexternalhit|slackbot|whatsapp|telegrambot|discordbot|preview/i;

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";

  if (BOT_USER_AGENT.test(userAgent)) {
    const headers = new Headers(request.headers);
    headers.delete("accept-language");
    request = new NextRequest(request, { headers });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|admin|prijava|_next|_vercel|.*\\..*).*)"],
};
