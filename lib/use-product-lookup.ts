"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { lookupProduct } from "@/lib/catalogue";
import { useI18n } from "@/components/i18n/language-provider";

type Lookup = {
  product: Product | null;
  /** True while the catalogue hasn't answered — distinct from "answered: not found". */
  loading: boolean;
};

/**
 * Async, session-cached product resolution for rows that store only an id — cart lines and
 * wishlist entries. The row renders a skeleton while `loading`, upgrades (image, rating,
 * description) when the catalogue answers, and falls back to its own snapshot fields when the
 * product genuinely isn't in the catalogue (demo lines, delisted products).
 */
export function useProductLookup(id: string | null | undefined): Lookup {
  const { locale } = useI18n();
  const [state, setState] = useState<Lookup>({ product: null, loading: !!id });

  useEffect(() => {
    if (!id) {
      setState({ product: null, loading: false });
      return;
    }
    let cancelled = false;
    // Keep the previous product visible while revalidating (e.g. a locale switch).
    setState((s) => (s.loading ? s : { product: s.product, loading: true }));
    lookupProduct(locale, id).then((p) => {
      if (!cancelled) setState({ product: p, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [locale, id]);

  return state;
}
