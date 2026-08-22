"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { fetchRelated } from "@/lib/catalogue";
import { useI18n } from "@/components/i18n/language-provider";
import { ProductCard } from "@/components/home/ProductCard";

/** Real same-category picks from the catalogue (max 4). Nothing to show → no section. */
export function RelatedProducts({ currentId }: { currentId: string }) {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchRelated(locale, currentId)
      .then((rows) => {
        if (!cancelled) setItems(rows.slice(0, 4));
      })
      .catch(() => {
        /* no related — the section simply does not render */
      });
    return () => {
      cancelled = true;
    };
  }, [locale, currentId]);

  if (items.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <h2
        id="related-heading"
        className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {t.pdp.related}
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            bestsellerLabel={t.deals.bestseller}
            wishlistLabel={t.header.wishlist}
          />
        ))}
      </div>
    </section>
  );
}
