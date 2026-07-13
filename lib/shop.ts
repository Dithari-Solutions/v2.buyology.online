import type { Product } from "@/lib/products";

export type Filters = {
  categories: string[];
  /** "any" | one of PRICE_BRACKETS keys */
  price: string;
  /** minimum rating: 0 (any) | 3 | 4 | 4.5 */
  rating: number;
  onSale: boolean;
  bestseller: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  categories: [],
  price: "any",
  rating: 0,
  onSale: false,
  bestseller: false,
};

export const PRICE_BRACKETS = [
  { key: "u100", min: 0, max: 100 },
  { key: "mid1", min: 100, max: 300 },
  { key: "mid2", min: 300, max: 700 },
  { key: "high", min: 700, max: Infinity },
] as const;

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

function inBracket(price: number, key: string) {
  if (key === "any") return true;
  const b = PRICE_BRACKETS.find((x) => x.key === key);
  return b ? price >= b.min && price < b.max : true;
}

export function applyFilters(items: Product[], f: Filters): Product[] {
  return items.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (!inBracket(p.price, f.price)) return false;
    if (p.rating < f.rating) return false;
    if (f.onSale && p.discount < 25) return false;
    if (f.bestseller && !p.bestseller) return false;
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
    (f.price !== "any" ? 1 : 0) +
    (f.rating > 0 ? 1 : 0) +
    (f.onSale ? 1 : 0) +
    (f.bestseller ? 1 : 0)
  );
}
