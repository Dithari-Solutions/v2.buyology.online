import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import type { Locale } from "@/lib/i18n/config";
import type { Product } from "@/lib/products";

/**
 * The real catalogue, adapted onto the exact Product shape every v2 renderer already consumes —
 * so the cards, cart and wishlist keep compiling while the data underneath becomes real.
 *
 * Contract notes that shape this module:
 * - Every image URL is a presigned S3 link. The backend keeps product-image URLs byte-identical
 *   for ~4h (6h signature) and the objects carry `public, max-age=21600`, so they ARE cache- and
 *   optimizer-friendly within a session — render through next/image, just never persist a URL.
 * - List responses are bare arrays with NO total count — page until a short page.
 * - The market is fixed to the UAE for now (countryCode=UAE, prices in AED): v2 has no country
 *   selector yet, and without countryCode the backend prices from the global-cheapest store,
 *   which is not what a UAE customer pays.
 * - Multi-value filter params must serialize as repeated keys (brandIds=a&brandIds=b) — Spring
 *   binding ignores the bracket form.
 * - /api/product/search binds free text as `q`; /api/product/search-elastic binds it as `query`.
 *   The wrong name silently returns everything.
 */

import { currentMarket, type Market } from "@/lib/market";
const LANGUAGE: Record<Locale, "EN" | "AZ" | "AR"> = { en: "EN", az: "AZ", ar: "AR" };

// ── Backend shapes (the fields v2 renders) ───────────────────────────────────

type ApiMedia = {
  url?: string | null;
  thumbnailUrl?: string | null;
  isPrimary?: boolean | null;
  orderIndex?: number | null;
  mediaType?: string | null;
};

type ApiSpecOption = { id: string; value?: string | null; unit?: string | null; additionalPrice?: number | null };
type ApiSpec = { id: string; code?: string | null; name?: string | null; options?: ApiSpecOption[] | null };

export type ApiProduct = {
  id: string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  sku?: string | null;
  categoryId?: string | null;
  brandName?: string | null;
  storeId?: string | null;
  storePrice?: number | null;
  effectivePrice?: number | null;
  originalPrice?: number | null;
  currency?: string | null;
  availabilityStatus?: string | null;
  availableInSelectedCountry?: boolean | null;
  stockQuantity?: number | null;
  isSuperDeal?: boolean | null;
  isLimitedStock?: boolean | null;
  expressDelivery?: boolean | null;
  expressDeliveryFee?: number | null;
  freeDelivery?: boolean | null;
  deliveryFee?: number | null;
  averageRating?: number | null;
  totalReviews?: number | null;
  media?: ApiMedia[] | null;
  specs?: ApiSpec[] | null;
  colors?: string[] | null;
};

export type Category = {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  reviewerName?: string | null;
  createdAt?: string | null;
};

/** The backend's ReviewResponse — first/last name and `body`, never title/comment. */
type ApiReview = {
  id: string;
  rating: number;
  body?: string | null;
  userFirstName?: string | null;
  userLastName?: string | null;
  createdAt?: string | null;
};

// ── Fetch plumbing ───────────────────────────────────────────────────────────

function params(locale: Locale, extra: Record<string, unknown> = {}, market?: Market): URLSearchParams {
  const m = market ?? currentMarket();
  const p = new URLSearchParams();
  p.set("lang", LANGUAGE[locale]);
  p.set("countryCode", m.countryCode);
  p.set("currency", m.currency);
  for (const [k, v] of Object.entries(extra)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((item) => p.append(k, String(item))); // repeated keys, not brackets
    else p.set(k, String(v));
  }
  return p;
}

async function get<T>(path: string, search: URLSearchParams): Promise<T> {
  // Server side this opts into Next's data cache (60s — matching the backend's own
  // micro-cache TTL); in the browser the `next` option is inert and the default HTTP
  // cache honours the backend's `max-age=60`, so repeat navigations stop refetching.
  const res = await fetch(backendUrl(`${path}?${search}`), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  const body = (await res.json()) as ApiEnvelope<T>;
  if (body.data == null) throw new Error(`${path}: empty`);
  return body.data;
}

// ── Categories (cached per locale for the session — names label the cards) ──

// Keyed per locale AND market: on the server this cache outlives a request, and one
// region's category names must never be served to another region's render. TTL'd so an
// admin category rename reaches long-lived server processes within minutes, not never.
const CATEGORY_TTL_MS = 5 * 60_000;
const categoryCache = new Map<string, { promise: Promise<Category[]>; at: number }>();

export function fetchCategories(locale: Locale, market?: Market): Promise<Category[]> {
  const m = market ?? currentMarket();
  const cacheKey = `${locale}:${m.countryCode}`;
  const entry = categoryCache.get(cacheKey);
  let cached = entry && Date.now() - entry.at <= CATEGORY_TTL_MS ? entry.promise : undefined;
  if (!cached) {
    cached = get<Category[]>("/api/category", params(locale, {}, market)).catch((err) => {
      categoryCache.delete(cacheKey); // a failed fetch must not poison the session
      throw err;
    });
    categoryCache.set(cacheKey, { promise: cached, at: Date.now() });
  }
  return cached;
}

// ── The adapter ──────────────────────────────────────────────────────────────

/** Spec chips for the card, the way the catalogue names them: "16 GB", "1 TB", "M4". */
function specChips(specs: ApiSpec[] | null | undefined): string[] {
  if (!specs) return [];
  const wanted = ["ram", "storage", "processor"];
  const chips: string[] = [];
  for (const code of wanted) {
    const spec = specs.find((x) => x.code?.toLowerCase() === code);
    const first = spec?.options?.[0];
    if (first?.value) chips.push([first.value, first.unit].filter(Boolean).join(" "));
  }
  return chips;
}

function primaryImage(media: ApiMedia[] | null | undefined): string | null {
  if (!media || media.length === 0) return null;
  const sorted = [...media].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  return (sorted.find((m) => m.isPrimary)?.url ?? sorted[0]?.url) ?? null;
}

/** Backend product → the Product view-type every renderer consumes. */
export function toProduct(api: ApiProduct, categoryName?: string): Product {
  const price = api.storePrice ?? api.effectivePrice ?? 0;
  const oldPrice = api.originalPrice ?? price;
  const discount = oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  return {
    id: api.id,
    name: api.title ?? api.sku ?? "—",
    category: categoryName ?? "",
    description: api.description ?? "",
    tags: specChips(api.specs),
    href: `/product/${api.id}`,
    image: primaryImage(api.media) ?? "",
    alt: api.title ?? "",
    icon: undefined,
    price,
    oldPrice,
    discount,
    rating: api.averageRating ?? 0,
    reviews: api.totalReviews ?? 0,
    bestseller: api.isSuperDeal ?? false,
    currency: api.currency ?? currentMarket().currency,
    storeId: api.storeId ?? undefined,
    stock: api.stockQuantity ?? undefined,
    inStock: api.availabilityStatus !== "OUT_OF_STOCK",
    slug: api.slug ?? undefined,
  };
}

async function withCategoryNames(locale: Locale, rows: ApiProduct[]): Promise<Product[]> {
  // Sellable items only: availableInSelectedCountry=false means "browse only" — a card the
  // customer cannot buy does not belong in a shopping grid.
  const sellable = rows.filter((r) => r.availableInSelectedCountry !== false);
  let byId = new Map<string, string>();
  try {
    byId = new Map((await fetchCategories(locale)).map((c) => [c.id, c.name]));
  } catch {
    /* category names degrade to blank labels; the grid still works */
  }
  return sellable.map((r) => toProduct(r, r.categoryId ? byId.get(r.categoryId) : undefined));
}

// ── Catalogue calls ──────────────────────────────────────────────────────────

export const PAGE_SIZE = 24;

export async function fetchProducts(
  locale: Locale,
  opts: { page?: number; sort?: "POPULAR" | "NEWEST" | "PRICE_ASC" | "PRICE_DESC" } = {},
): Promise<{ items: Product[]; hasMore: boolean }> {
  const rows = await get<ApiProduct[]>(
    "/api/product",
    params(locale, { page: opts.page ?? 0, size: PAGE_SIZE, sort: opts.sort }),
  );
  return {
    items: await withCategoryNames(locale, rows),
    // No total count exists anywhere in the contract; a full page means "probably more".
    hasMore: rows.length === PAGE_SIZE,
  };
}

export type CatalogueQuery = {
  categoryIds?: string[];
  /** Inclusive bounds in the display currency (AED). Omit a bound to leave it open. */
  minPrice?: number;
  maxPrice?: number;
  superDealsOnly?: boolean;
};

/**
 * Filtered catalogue via GET /api/product/search — the one public endpoint that filters
 * server-side. Its contract, mapped from the backend:
 *  - categoryId is a SINGLE exact UUID (no descendant expansion), so multi-select fans out to
 *    one request per category and merges, deduped by product id;
 *  - minPrice/maxPrice are inclusive and applied to the resolved DISPLAY price (discounts
 *    already in, converted to the requested currency) — exactly the number our cards show;
 *  - there is NO pagination: the response is the complete matched list, which is what makes
 *    filters and sorts globally correct instead of "over whatever pages happened to load".
 */
export async function searchCatalogue(locale: Locale, q: CatalogueQuery): Promise<Product[]> {
  const base = {
    minPrice: q.minPrice,
    maxPrice: q.maxPrice,
    isSuperDeal: q.superDealsOnly ? true : undefined,
  };
  const ids = q.categoryIds?.filter(Boolean) ?? [];
  const requests =
    ids.length > 0
      ? ids.map((categoryId) =>
          get<ApiProduct[]>("/api/product/search", params(locale, { ...base, categoryId })),
        )
      : [get<ApiProduct[]>("/api/product/search", params(locale, base))];
  // One flaky category request must not blank the whole result: merge what succeeded and
  // only fail when EVERY request failed (so the caller's error path still fires).
  const settled = await Promise.allSettled(requests);
  const batches = settled
    .filter((s): s is PromiseFulfilledResult<ApiProduct[]> => s.status === "fulfilled")
    .map((s) => s.value);
  if (batches.length === 0 && settled.length > 0) {
    throw (settled[0] as PromiseRejectedResult).reason;
  }
  const seen = new Set<string>();
  const rows: ApiProduct[] = [];
  for (const batch of batches) {
    for (const row of batch) {
      if (row.id && !seen.has(row.id)) {
        seen.add(row.id);
        rows.push(row);
      }
    }
  }
  return withCategoryNames(locale, rows);
}

export async function fetchProductDetail(
  locale: Locale,
  id: string,
  market?: Market,
): Promise<ApiProduct> {
  return get<ApiProduct>(`/api/product/${id}`, params(locale, {}, market));
}

export async function fetchRelated(locale: Locale, id: string): Promise<Product[]> {
  const rows = await get<ApiProduct[]>(`/api/product/${id}/related`, params(locale));
  return withCategoryNames(locale, rows);
}

export async function searchProducts(locale: Locale, query: string): Promise<Product[]> {
  // Elastic route binds the text as `query` (the filtered route binds `q`); it falls back to a
  // DB LIKE search server-side when Elasticsearch is down.
  const rows = await get<ApiProduct[]>("/api/product/search-elastic", params(locale, { query }));
  return withCategoryNames(locale, rows);
}

export async function fetchByCategory(locale: Locale, categoryId: string): Promise<Product[]> {
  const rows = await get<ApiProduct[]>(`/api/product/category/${categoryId}`, params(locale));
  return withCategoryNames(locale, rows);
}

export async function fetchPopularFor(locale: Locale, productIds: string[]): Promise<Product[]> {
  const rows = await get<ApiProduct[]>("/api/product/popular-for-you", params(locale, { productIds }));
  return withCategoryNames(locale, rows);
}

export async function fetchSuperDeals(locale: Locale): Promise<Product[]> {
  const rows = await get<ApiProduct[]>("/api/product/super-deals", params(locale));
  return withCategoryNames(locale, rows);
}

// ── Single-product lookup with a session cache (cart/wishlist enrichment) ───

const lookupCache = new Map<string, Promise<Product | null>>();

/**
 * Resolve one product by id, cached for the session. The cart and wishlist store only narrow
 * snapshots and re-resolve rich detail per row — uncached, a 10-row cart would fire 10 detail
 * requests per render mount.
 */
export function lookupProduct(locale: Locale, id: string): Promise<Product | null> {
  const key = `${locale}:${id}`;
  let hit = lookupCache.get(key);
  if (!hit) {
    hit = fetchProductDetail(locale, id)
      .then(async (api) => {
        let name: string | undefined;
        try {
          const cats = await fetchCategories(locale);
          name = cats.find((c) => c.id === api.categoryId)?.name;
        } catch {
          /* blank label */
        }
        return toProduct(api, name);
      })
      .catch(() => {
        lookupCache.delete(key); // do not cache failures — the product may simply be loading
        return null;
      });
    lookupCache.set(key, hit);
  }
  return hit;
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export type ReviewStats = {
  totalReviews: number;
  averageRating: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
};

/** Pre-aggregated per-star counts — zeros when the product has no stats row yet. */
export async function fetchReviewStats(productId: string): Promise<ReviewStats | null> {
  const res = await fetch(backendUrl(`/api/reviews/product/${productId}/stats`), { cache: "no-store" });
  if (!res.ok) return null;
  const body = (await res.json()) as ApiEnvelope<ReviewStats>;
  return body.data ?? null;
}

export async function fetchReviews(locale: Locale, productId: string, page = 0): Promise<Review[]> {
  const p = new URLSearchParams({ page: String(page), size: "10" });
  const res = await fetch(backendUrl(`/api/reviews/product/${productId}?${p}`), { cache: "no-store" });
  if (!res.ok) return [];
  const body = (await res.json()) as ApiEnvelope<ApiReview[]>;
  return (body.data ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.body ?? null,
    reviewerName: [r.userFirstName, r.userLastName].filter(Boolean).join(" ") || null,
    createdAt: r.createdAt ?? null,
  }));
}
