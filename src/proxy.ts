import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "./lib/admin-auth";

const intlMiddleware = createMiddleware(routing);

// Search engine / social preview crawlers must always see the unprefixed
// Slovenian page at "/", never a language-detection redirect. Since Accept-Language
// is what next-intl's redirect decision is based on, we strip it for known bots
// before handing the request off, so they fall through to the default locale.
const BOT_USER_AGENT = /bot|crawl|spider|slurp|facebookexternalhit|slackbot|whatsapp|telegrambot|discordbot|preview/i;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (pathname.startsWith("/admin")) {
    if (!isValidSessionToken(sessionToken)) {
      return NextResponse.redirect(new URL("/prijava", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/prijava") {
    if (isValidSessionToken(sessionToken)) {
      return NextResponse.redirect(new URL("/admin/termini", request.url));
    }
    return NextResponse.next();
  }

  const userAgent = request.headers.get("user-agent") ?? "";

  if (BOT_USER_AGENT.test(userAgent)) {
    const headers = new Headers(request.headers);
    headers.delete("accept-language");
    request = new NextRequest(request, { headers });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
