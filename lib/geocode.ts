import { MARKETS } from "@/lib/market";
import { phoneCountries } from "@/lib/phone-codes";

/**
 * Reverse geocoding via OpenStreetMap's Nominatim — the same free, key-less service the previous
 * storefront already used in production for this exact purpose. zoom=18 asks for building-level
 * detail so the street line is precise. Best-effort: null on any failure, and the caller falls
 * back to manual entry — a geocoder outage must never block adding an address.
 */
export interface ReverseGeocodeResult {
  /** Precise street line for address line 1 (house number + road, or the nearest feature). */
  line: string;
  neighbourhood: string | null;
  city: string | null;
  /** Province / region / emirate / state. */
  state: string | null;
  postalCode: string | null;
  /** ISO 3166-1 alpha-2, uppercased (e.g. "AE"). */
  countryCode: string | null;
  /** Human-readable country name in English. */
  countryName: string | null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&zoom=18`,
      { headers: { "Accept-Language": "en" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = (data?.address ?? {}) as Record<string, string | undefined>;

    const road = a.road || a.pedestrian || a.footway || a.residential || null;
    const houseNumber = a.house_number || null;
    const neighbourhood = a.neighbourhood || a.suburb || a.quarter || null;
    const city = a.city || a.town || a.village || a.municipality || a.county || null;
    const state = a.state || a.region || a.province || a.state_district || null;

    const street = houseNumber && road ? `${houseNumber} ${road}` : road;
    const named = (data?.name as string | undefined) || null;
    const line =
      [street, neighbourhood].filter(Boolean).join(", ") ||
      named ||
      (data?.display_name as string | undefined) ||
      "";

    return {
      line,
      neighbourhood,
      city,
      state,
      postalCode: a.postcode || null,
      countryCode: a.country_code ? a.country_code.toUpperCase() : null,
      countryName: a.country || null,
    };
  } catch {
    return null;
  }
}

/** The country value the address form submits: a code, never a display name. */
export function countryFieldValue(g: ReverseGeocodeResult): string {
  return countryCodeFor(g.countryCode);
}

/**
 * The API stores a 2-3 character country code and rejects anything longer
 * ("country: size must be between 2 and 3"), so a display name must never reach it — returning
 * the geocoder's `countryName` made every address outside the UAE fail to save.
 *
 * Served markets use their alpha-3 (the backend's own spelling, e.g. "UAE" for the Emirates),
 * derived from MARKETS so the two can never drift; anywhere else keeps the alpha-2, which is
 * also within the limit.
 */
export function countryCodeFor(countryCode: string | null | undefined): string {
  const alpha2 = (countryCode ?? "").trim().toUpperCase();
  if (!alpha2) return "";
  const market = MARKETS.find((m) => m.alpha2 === alpha2);
  return market ? market.countryCode : alpha2.slice(0, 3);
}

/**
 * Normalise whatever ends up in the address form's country box before it is submitted.
 *
 * The box is free text and is usually filled from the map pin, but a customer can type in it —
 * and typing "Azerbaijan" would be rejected by the API's 2-3 character limit with a message
 * that reads like a bug. A recognised country NAME is therefore resolved to its code, an
 * already-valid code passes through, and anything unrecognised is left alone so the API's own
 * validation still has the last word rather than this silently inventing a country.
 */
export function normalizeCountryInput(value: string): string {
  const raw = value.trim();
  if (!raw) return raw;
  if (raw.length <= 3) return raw.toUpperCase();

  const lower = raw.toLowerCase();
  const byName = phoneCountries.find((c) => c.name.toLowerCase() === lower);
  if (byName) return countryCodeFor(byName.iso2);

  // "United Arab Emirates" and friends: fall back to a unique prefix match.
  const prefixed = phoneCountries.filter((c) => c.name.toLowerCase().startsWith(lower));
  if (prefixed.length === 1) return countryCodeFor(prefixed[0].iso2);

  return raw;
}
