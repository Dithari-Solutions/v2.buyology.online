/**
 * Region resolution for the subdomain-per-market architecture.
 *
 * Each served region lives on its own host and CANNOT reach another region's shop:
 * nginx geolocates the visitor (X-Geo-Country) and the middleware redirects them to
 * their region's subdomain — or to the global landing on web.buyology.online when we
 * don't serve their country. The market itself is derived from the HOST, identically
 * on the server (Host header) and the client (location.hostname), so both renders
 * agree without any per-request global state.
 *
 * UAE is the priority region: it lives on the MAIN domain and is the only market with
 * payments enabled (Paymob). Other regions launch browse-only until their own payment
 * providers exist.
 */

export type Market = {
  /** Subdomain label ("" for the main/UAE host). */
  region: string;
  /** ISO 3166-1 alpha-3, as the backend stores country. */
  countryCode: string;
  /** ISO 3166-1 alpha-2, as geo headers report visitors. */
  alpha2: string;
  /** ISO 4217 display/charge currency. */
  currency: string;
  /** Production host for this market. */
  host: string;
  /** Paymob is UAE-only today; other regions are browse-only until their rails exist. */
  paymentsEnabled: boolean;
};

export const UAE_MARKET: Market = {
  region: "",
  countryCode: "UAE", // the backend's historical spelling for ARE
  alpha2: "AE",
  currency: "AED",
  host: "buyology.online",
  paymentsEnabled: true,
};

export const MARKETS: Market[] = [
  UAE_MARKET,
  { region: "in", countryCode: "IND", alpha2: "IN", currency: "INR", host: "in.buyology.online", paymentsEnabled: false },
  { region: "sa", countryCode: "SAU", alpha2: "SA", currency: "SAR", host: "sa.buyology.online", paymentsEnabled: false },
  { region: "bh", countryCode: "BHR", alpha2: "BH", currency: "BHD", host: "bh.buyology.online", paymentsEnabled: false },
  { region: "qa", countryCode: "QAT", alpha2: "QA", currency: "QAR", host: "qa.buyology.online", paymentsEnabled: false },
  { region: "om", countryCode: "OMN", alpha2: "OM", currency: "OMR", host: "om.buyology.online", paymentsEnabled: false },
  { region: "az", countryCode: "AZE", alpha2: "AZ", currency: "AZN", host: "az.buyology.online", paymentsEnabled: false },
];

/** The global landing for visitors from countries we don't serve. */
export const GLOBAL_LANDING_HOST = "web.buyology.online";

/**
 * Market for a hostname. Unknown hosts — localhost, v2.buyology.online, previews —
 * resolve to UAE so today's staging behaviour is unchanged.
 */
export function marketFromHostname(hostname: string | null | undefined): Market {
  const h = (hostname ?? "").toLowerCase().split(":")[0];
  for (const m of MARKETS) {
    if (m.region && (h === m.host || h.startsWith(m.region + "."))) return m;
  }
  return UAE_MARKET;
}

/** Whether geo-routing applies to this host at all (staging/dev are exempt). */
export function isRoutedHost(hostname: string | null | undefined): boolean {
  const h = (hostname ?? "").toLowerCase().split(":")[0];
  return h === GLOBAL_LANDING_HOST || MARKETS.some((m) => h === m.host);
}

/** The market a VISITOR belongs to, from a geo header's alpha-2 country. Null = unserved. */
export function marketForVisitor(alpha2: string | null | undefined): Market | null {
  const code = (alpha2 ?? "").toUpperCase();
  return MARKETS.find((m) => m.alpha2 === code) ?? null;
}

/** Client-side market (SSR-safe: UAE until the browser knows its hostname). */
export function currentMarket(): Market {
  if (typeof window === "undefined") return UAE_MARKET;
  return marketFromHostname(window.location.hostname);
}
