import type { Product } from "@/lib/products";

export type Filters = {
  /** Category IDs (the backend filters by UUID; names are only labels). */
  categories: string[];
  /** Inclusive AED bounds from the slider; null = that side unbounded. */
  priceMin: number | null;
  priceMax: number | null;
  /** minimum rating: 0 (any) | 3 | 4 | 4.5 */
  rating: number;
  onSale: boolean;
  bestseller: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  categories: [],
  priceMin: null,
  priceMax: null,
  rating: 0,
  onSale: false,
  bestseller: false,
};

export const RATING_OPTIONS = [4.5, 4, 3] as const;

export type SortKey =
  | "featured"
  | "priceAsc"
  | "priceDesc"
  | "rating"
  | "reviews"
  | "discount";

export const SORT_KEYS: SortKey[] = [
  "featured",
  "priceAsc",
  "priceDesc",
  "rating",
  "reviews",
  "discount",
];

/**
 * The predicates the backend cannot apply. Category, price, and super-deal go to
 * /api/product/search; rating and on-sale have no server equivalent and run here — over the
 * COMPLETE matched set that endpoint returns, so they are still globally correct.
 */
export function applyClientFilters(items: Product[], f: Filters): Product[] {
  return items.filter((p) => {
    if (p.rating < f.rating) return false;
    if (f.onSale && p.discount < 25) return false;
    return true;
  });
}

export function sortProducts(items: Product[], sort: SortKey): Product[] {
  const arr = [...items];
  switch (sort) {
    case "priceAsc":
      return arr.sort((a, b) => a.price - b.price);
    case "priceDesc":
      return arr.sort((a, b) => b.price - a.price);
    case "rating":
      return arr.sort((a, b) => b.rating - a.rating);
    case "reviews":
      return arr.sort((a, b) => b.reviews - a.reviews);
    case "discount":
      return arr.sort((a, b) => b.discount - a.discount);
    default:
      return arr; // featured — catalogue order
  }
}

export function activeFilterCount(f: Filters): number {
  return (
    f.categories.length +
    (f.priceMin != null || f.priceMax != null ? 1 : 0) +
    (f.rating > 0 ? 1 : 0) +
    (f.onSale ? 1 : 0) +
    (f.bestseller ? 1 : 0)
  );
}

/** True when the current state needs the server-filtered complete list rather than paged browse. */
export function needsServerSearch(f: Filters, sort: SortKey): boolean {
  return activeFilterCount(f) > 0 || sort !== "featured";
}
