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

/** The backend stores country as the market string ("UAE"), not ISO codes — map the common ones. */
export function countryFieldValue(g: ReverseGeocodeResult): string {
  if (g.countryCode === "AE") return "UAE";
  return g.countryName ?? g.countryCode ?? "";
}
