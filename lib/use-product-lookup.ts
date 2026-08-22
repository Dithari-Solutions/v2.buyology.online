"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { lookupProduct } from "@/lib/catalogue";
import { useI18n } from "@/components/i18n/language-provider";

/**
 * Async, session-cached product resolution for rows that store only an id — cart lines and
 * wishlist entries. Replaces the synchronous mock getProduct(): the row renders from its snapshot
 * immediately and upgrades (image, rating, description) when the catalogue answers; a missing
 * product stays null and the row simply keeps its snapshot fields.
 */
export function useProductLookup(id: string | null | undefined): Product | null {
  const { locale } = useI18n();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    lookupProduct(locale, id).then((p) => {
      if (!cancelled) setProduct(p);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, id]);

  return product;
}
