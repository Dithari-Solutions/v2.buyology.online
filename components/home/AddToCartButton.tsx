"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";
import { useFly } from "@/components/fx/FlyProvider";
import { useI18n } from "@/components/i18n/language-provider";
import { BagIcon, CheckIcon } from "@/components/icons";
import {
  CartQuantityStepper,
  useCartLineFor,
} from "@/components/cart/CartQuantityStepper";

/**
 * Add-to-cart with a fly-to-cart dot; the drawer opens when the dot lands.
 *
 * <p>Once the product IS in the cart this becomes a quantity control instead. Every listing surface
 * goes through here — the home carousels, the products grid, search results, related products and the
 * wishlist all render ProductCard, which renders this — so there is one place to change and no chance
 * of one grid behaving differently from another.
 */
export function AddToCartButton({ product }: { product: Product }) {
  const { t } = useI18n();
  const { addItem } = useCart();
  const { fly } = useFly();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const line = useCartLineFor(product.id);
  // A tracked count of zero means it cannot be bought, whatever the status column says. undefined is
  // "not tracked" — no ceiling — so this is a strict === 0, not a falsy test.
  const soldOut = product.inStock === false || product.availableUnits === 0;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        storeId: product.storeId,
        currency: product.currency,
      },
      { openDrawer: false },
    );
    fly(e.currentTarget, "cart");
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  if (line) {
    return (
      <CartQuantityStepper
        productId={product.id}
        productName={product.name}
        className="mt-3"
      />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={soldOut}
        aria-label={soldOut ? t.pdp.outOfStock : t.deals.addToCart}
        className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          added
            ? "bg-primary text-primary-fg"
            : "bg-surface-2 text-foreground hover:bg-primary hover:text-primary-fg"
        } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface-2 disabled:hover:text-foreground`}
      >
        {soldOut ? (
          t.pdp.outOfStock
        ) : added ? (
          <>
            <CheckIcon className="buyo-pop h-[18px] w-[18px]" />
            {t.cart.added}
          </>
        ) : (
          <>
            <BagIcon className="h-[18px] w-[18px]" />
            {t.deals.addToCart}
          </>
        )}
      </button>
      {/* Announce success once (not on the auto-revert). */}
      <span className="sr-only" role="status" aria-live="polite">
        {added ? `${product.name} — ${t.cart.added}` : ""}
      </span>
    </>
  );
}
