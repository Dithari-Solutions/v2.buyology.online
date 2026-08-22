"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { lookupProduct } from "@/lib/catalogue";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { useCart } from "@/components/cart/cart-provider";
import { useI18n } from "@/components/i18n/language-provider";
import { ProductCard } from "@/components/home/ProductCard";
import { BagIcon, HeartIcon } from "@/components/icons";

/** Wishlist page contents. Reads the wishlist store; each card's heart removes. */
export function WishlistView() {
  const { t } = useI18n();
  const { items } = useWishlist();
  const { addItem, open } = useCart();

  const { locale } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(items.map((id) => lookupProduct(locale, id))).then((rows) => {
      if (!cancelled) setProducts(rows.filter((p): p is Product => p !== null));
    });
    return () => {
      cancelled = true;
    };
  }, [items, locale]);

  // Ids exist but none has resolved yet — that is loading, not an empty wishlist.
  if (items.length > 0 && products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy>
        {Array.from({ length: Math.min(items.length, 4) }, (_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
          <HeartIcon className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-semibold text-foreground">
          {t.wishlist.empty}
        </h1>
        <p className="text-muted">{t.wishlist.emptyHint}</p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  function addAll() {
    products.forEach((p) =>
      addItem(
        { id: p.id, name: p.name, price: p.price, category: p.category, storeId: p.storeId, currency: p.currency },
        { openDrawer: false },
      ),
    );
    open();
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t.header.wishlist}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {products.length} {t.header.itemsSuffix}
          </p>
        </div>
        <button
          type="button"
          onClick={addAll}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BagIcon className="h-4 w-4" />
          {t.wishlist.addAll}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            bestsellerLabel={t.deals.bestseller}
            wishlistLabel={t.header.wishlist}
          />
        ))}
      </div>
    </>
  );
}
