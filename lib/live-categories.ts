"use client";

import { useEffect, useState } from "react";
import { fetchCategories, fetchNavigationCatalogue, type Category } from "@/lib/catalogue";
import { stockedCategories } from "@/lib/category-nav";
import { useI18n } from "@/components/i18n/language-provider";

export { categoryHref, categoryIcon } from "@/lib/category-nav";

/**
 * Active categories with products in the visitor's market, shared by header navigation,
 * mobile navigation and the command palette. Unbranded products count too. Availability
 * and brand tiles share a single catalogue read; names arrive in the requested language.
 *
 * `null` while loading (render a skeleton), `[]` on failure (render nothing — the
 * all-products link always stands). fetchCategories memoizes per locale+market with a
 * short TTL, so every consumer in the header shares the requests.
 */
export function useLiveCategories(): Category[] | null {
  const { locale } = useI18n();
  const [result, setResult] = useState<{ locale: string; categories: Category[] } | null>(null);

  useEffect(() => {
    let stale = false;
    Promise.all([fetchCategories(locale), fetchNavigationCatalogue(locale)])
      .then(([list, inventory]) => {
        if (!stale) setResult({ locale, categories: stockedCategories(list, inventory.categoryIds) });
      })
      .catch(() => {
        if (!stale) setResult({ locale, categories: [] });
      });
    return () => {
      stale = true;
    };
  }, [locale]);

  return result?.locale === locale ? result.categories : null;
}
