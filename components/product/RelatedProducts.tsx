"use client";

import { flashDeals } from "@/lib/products";
import { useI18n } from "@/components/i18n/language-provider";
import { ProductCard } from "@/components/home/ProductCard";

export function RelatedProducts({ currentId }: { currentId: string }) {
  const { t } = useI18n();
  const items = flashDeals.filter((p) => p.id !== currentId).slice(0, 4);

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
