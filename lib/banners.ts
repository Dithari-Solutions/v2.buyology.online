import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import type { Locale } from "@/lib/i18n/config";

/**
 * Promo banners managed in the admin dashboard: GET /api/banner returns the ACTIVE ones
 * for a platform, already ordered by sortOrder.
 *
 * Every field except the image is OPTIONAL and is null on today's live banners — they are
 * uploaded as finished artwork with the copy baked into the image. So the renderer must
 * treat text/button as enhancements: never invent an eyebrow, headline or CTA that the
 * admin did not write, and never make a banner a link without a buttonUrl.
 */

export type Banner = {
  id: string;
  backgroundImageUrl?: string | null;
  text?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  sortOrder?: number | string | null;
};

/** Backend Language enum values (uppercased locale). */
const LANGUAGE: Record<Locale, string> = { en: "EN", az: "AZ", ar: "AR" };

/**
 * Active WEB banners, newest campaign first by sortOrder. Never throws — an empty list
 * means "render no banners", which the home page handles by omitting the region rather
 * than showing placeholder artwork.
 */
export async function fetchBanners(locale: Locale): Promise<Banner[]> {
  try {
    const search = new URLSearchParams({
      language: LANGUAGE[locale] ?? "EN",
      platform: "WEB",
    });
    const res = await fetch(backendUrl(`/api/banner?${search}`), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiEnvelope<Banner[]>;
    return (body.data ?? []).filter((b) => !!b.backgroundImageUrl);
  } catch {
    return [];
  }
}

/** How many banners lead the region as the big rotating hero; the rest become side tiles. */
export const HERO_BANNER_COUNT = 4;
