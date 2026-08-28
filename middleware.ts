import { NextRequest, NextResponse } from "next/server";
import {
  GLOBAL_LANDING_HOST,
  isRoutedHost,
  marketForVisitor,
  marketFromHostname,
} from "@/lib/market";

const REGION_COOKIE = "buyo-region-choice";

/**
 * Search-engine and social crawlers, which are never geo-redirected.
 *
 * Googlebot crawls almost entirely from US IPs. Redirect it by IP and buyology.online serves it a
 * 307 to the global landing on every request — Google then indexes a one-page welcome screen in
 * place of the store, and the UAE site it was ranking disappears. Google's own guidance is not to
 * redirect crawlers by location for exactly this reason.
 *
 * Matching on user-agent is spoofable, and deliberately so: the worst a forged bot string buys is
 * a person abroad seeing the UAE storefront, which is the same thing the region-choice cookie
 * already grants on request. Losing the search rankings is the incomparably larger risk.
 */
const CRAWLER_UA =
  /(googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex(bot|images)|applebot|petalbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|embedly|quora link preview|pinterest|redditbot|slackbot|ia_archiver|ahrefsbot|semrushbot|screaming frog|lighthouse|chrome-lighthouse|gptbot|oai-searchbot|chatgpt-user|claudebot|perplexitybot|google-inspectiontool)/i;

function isCrawler(req: NextRequest): boolean {
  return CRAWLER_UA.test(req.headers.get("user-agent") ?? "");
}

/**
 * Region isolation at the door. nginx geolocates every visitor and forwards exactly two
 * headers — which it must SET unconditionally so clients cannot inject them:
 *   X-Geo-Country:   ISO alpha-2 of the visitor's IP country
 *   X-Geo-Anonymous: "1" when the IP is a known VPN/proxy/hosting exit (phase 2 data)
 * Host is likewise nginx-controlled; no forwardable header is trusted for isolation.
 *
 * Rules, applied only on production hosts (staging/dev/localhost are exempt):
 *   - a visitor from a served country lands on that country's subdomain, wherever they knocked;
 *   - a visitor from an unserved country lands on the global landing at web.buyology.online,
 *     where an EXPLICIT region choice (link → cookie) lets them browse a region anyway;
 *   - a detected VPN/proxy gets the landing with no override — VPN use is not allowed;
 *   - no geo header means no opinion (nginx not configured / health checks): no redirect.
 * The mapping is deterministic both ways, so a redirect can never loop.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  if (!isRoutedHost(host)) return NextResponse.next();

  // Before any geo decision: a crawler is served whatever host it asked for. See CRAWLER_UA.
  if (isCrawler(req)) return NextResponse.next();

  const geo = req.headers.get("x-geo-country");
  const anonymous = req.headers.get("x-geo-anonymous") === "1";
  const bareHost = host.split(":")[0];
  const onLanding = bareHost === GLOBAL_LANDING_HOST;

  // The landing page itself belongs to the web host only.
  if (!onLanding && req.nextUrl.pathname === "/global-welcome") {
    return NextResponse.redirect(new URL("/", req.nextUrl), 307);
  }

  if (anonymous) {
    return onLanding ? rewriteLanding(req) : redirectToLanding();
  }

  if (geo) {
    const visitorMarket = marketForVisitor(geo);
    if (!visitorMarket) {
      // Unserved country — but an explicit region choice from the landing is honored.
      if (!onLanding) {
        const chose = req.nextUrl.searchParams.has("choose-region");
        const preferred = req.cookies.get(REGION_COOKIE)?.value;
        if (chose || preferred === bareHost) {
          const res = NextResponse.next();
          if (chose) {
            res.cookies.set(REGION_COOKIE, bareHost, {
              path: "/",
              maxAge: 60 * 60 * 24 * 180,
              sameSite: "lax",
            });
          }
          return res;
        }
        return redirectToLanding();
      }
      return rewriteLanding(req);
    }
    const hostMarket = onLanding ? null : marketFromHostname(host);
    if (!hostMarket || hostMarket.host !== visitorMarket.host) {
      const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${visitorMarket.host}`);
      return NextResponse.redirect(url, 307);
    }
    return NextResponse.next();
  }

  // No geo signal: the landing still renders as itself; region hosts serve as addressed.
  return onLanding ? rewriteLanding(req) : NextResponse.next();
}

function redirectToLanding() {
  return NextResponse.redirect(`https://${GLOBAL_LANDING_HOST}/`, 307);
}

/** The web host serves ONLY the global landing, whatever path was requested. */
function rewriteLanding(req: NextRequest) {
  if (req.nextUrl.pathname === "/global-welcome") return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/global-welcome";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  // Pages only. Excluded: API routes, Next internals, generated metadata images
  // (apple-icon / opengraph-image / twitter-image are extension-less routes), and any
  // path with a file extension (favicon.png, logos, llms.txt, /mock assets, …).
  matcher: [
    "/((?!api|_next/static|_next/image|apple-icon|opengraph-image|twitter-image|.*\\..*).*)",
  ],
};
