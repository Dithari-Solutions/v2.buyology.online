"use client";

import Link from "next/link";
import { getProduct } from "@/lib/products";
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

  const products = items.flatMap((id) => {
    const p = getProduct(id);
    return p ? [p] : [];
  });

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
          className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t.cart.continueShopping}
        </Link>
      </div>
    );
  }

  function addAll() {
    products.forEach((p) =>
      addItem(
        { id: p.id, name: p.name, price: p.price, category: p.category },
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
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
