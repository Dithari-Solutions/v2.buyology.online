"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { fetchByCategory, fetchCategories, searchProducts } from "@/lib/catalogue";
import { useI18n } from "@/components/i18n/language-provider";
import { ProductCard } from "@/components/home/ProductCard";

/**
 * Real search results. Free text goes to the catalogue's full-text search (which falls back to a
 * database search server-side when Elasticsearch is down); a category param resolves against the
 * real category slugs — case-insensitively, since nav links carry lowercase historical slugs.
 */
export function SearchResults({ q, category }: { q?: string; category?: string }) {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run(): Promise<Product[]> {
      if (q) return searchProducts(locale, q);
      if (category) {
        const cats = await fetchCategories(locale);
        const match = cats.find(
          (c) =>
            c.slug?.toLowerCase() === category.toLowerCase() ||
            c.name?.toLowerCase() === category.toLowerCase(),
        );
        if (match) return fetchByCategory(locale, match.id);
      }
      return [];
    }
    run()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, q, category]);

  if (items === null) {
    return (
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3" aria-busy>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-border bg-surface px-5 py-10 text-center text-muted">
        {t.shop.empty}
      </p>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
      {items.map((p) => (
        <li key={p.id} className="h-full">
          <ProductCard
            product={p}
            bestsellerLabel={t.deals.bestseller}
            wishlistLabel={t.header.wishlist}
          />
        </li>
      ))}
    </ul>
  );
}
