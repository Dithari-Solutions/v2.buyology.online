"use client";

import { useEffect, useState } from "react";
import { fetchCategories, type Category } from "@/lib/catalogue";
import { renderableRoots } from "@/lib/category-nav";
import { useI18n } from "@/components/i18n/language-provider";

export { categoryHref, categoryIcon } from "@/lib/category-nav";

/**
 * The LIVE category taxonomy for client navigation surfaces (header mega-menu, mobile
 * menu, command palette). The static nav-data category list once pointed at slugs that
 * never existed in the backend — every link led to an empty page. Names arrive localized
 * per request language; links carry the category ID (ids are locale-stable, slugs are not).
 *
 * `null` while loading (render a skeleton), `[]` on failure (render nothing — the
 * all-products link always stands). fetchCategories memoizes per locale+market with a
 * short TTL, so every consumer in the header shares one request.
 */
export function useLiveCategories(): Category[] | null {
  const { locale } = useI18n();
  const [cats, setCats] = useState<Category[] | null>(null);

  useEffect(() => {
    let stale = false;
    fetchCategories(locale)
      .then((list) => {
        if (!stale) setCats(renderableRoots(list));
      })
      .catch(() => {
        if (!stale) setCats([]);
      });
    return () => {
      stale = true;
    };
  }, [locale]);

  return cats;
}
