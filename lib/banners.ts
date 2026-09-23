import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import type { Locale } from "@/lib/i18n/config";
import { fallbackBannerCopy } from "@/lib/banner-copy";

/**
 * Promo banners managed in the admin dashboard: GET /api/banner returns the ACTIVE ones
 * for a platform, already ordered by sortOrder.
 *
 * Every field except the image is OPTIONAL and is null on today's live banners — they were
 * uploaded as finished artwork with no words on them. So the renderer must treat text/button as
 * enhancements: never invent an eyebrow, headline or CTA, and never make a banner a link without
 * a buttonUrl.
 *
 * <p>The one exception is lib/banner-copy.ts, which carries approved copy for those six specific
 * banners because they have been empty in all three languages since upload. It applies only to a
 * banner that has nothing of its own — see {@link withApprovedCopy}.
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
    return (body.data ?? [])
      .filter((b) => !!b.backgroundImageUrl)
      .map((b) => withApprovedCopy(b, locale));
  } catch {
    return [];
  }
}

/**
 * Fills in the approved copy for a banner that carries none of its own.
 *
 * <p>All or nothing, per banner: one word typed into the dashboard — text, label or URL, in any
 * language — and this steps aside completely for that banner. Half the copy from an admin and half
 * from a file would pair someone's new link with an old headline, which is worse than either.
 */
function withApprovedCopy(banner: Banner, locale: Locale): Banner {
  const hasOwn = !!(banner.text?.trim() || banner.buttonLabel?.trim() || banner.buttonUrl?.trim());
  if (hasOwn) return banner;
  const copy = fallbackBannerCopy(banner.id, locale);
  return copy ? { ...banner, ...copy } : banner;
}

/** How many banners lead the region as the big rotating hero; the rest become side tiles. */
export const HERO_BANNER_COUNT = 4;
