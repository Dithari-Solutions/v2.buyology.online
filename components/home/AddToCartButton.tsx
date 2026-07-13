"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";
import { useFly } from "@/components/fx/FlyProvider";
import { useI18n } from "@/components/i18n/language-provider";
import { BagIcon, CheckIcon } from "@/components/icons";

/** Add-to-cart with a fly-to-cart dot; the drawer opens when the dot lands. */
export function AddToCartButton({ product }: { product: Product }) {
  const { t } = useI18n();
  const { addItem } = useCart();
  const { fly } = useFly();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      },
      { openDrawer: false },
    );
    fly(e.currentTarget, "cart");
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={t.deals.addToCart}
        className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          added
            ? "bg-brand text-white"
            : "bg-surface-2 text-foreground hover:bg-brand hover:text-white"
        }`}
      >
        {added ? (
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
