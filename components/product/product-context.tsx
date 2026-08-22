"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import type { ApiProduct } from "@/lib/catalogue";

/**
 * The one product this PDP renders, fetched ONCE by the server page and shared with every child.
 *
 * Exists because the previous children each re-resolved the product themselves — free with a mock
 * map, but three-plus detail requests per page view against a real API.
 */
type ProductContextValue = {
  product: Product;
  /** The raw backend record, for children that need media/specs/colors beyond the card shape. */
  api: ApiProduct;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductProvider({
  product,
  api,
  children,
}: ProductContextValue & { children: ReactNode }) {
  return <ProductContext.Provider value={{ product, api }}>{children}</ProductContext.Provider>;
}

export function useProduct(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within ProductProvider");
  return ctx;
}
