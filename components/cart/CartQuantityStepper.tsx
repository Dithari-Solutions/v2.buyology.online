"use client";

import { useCart } from "@/components/cart/cart-provider";
import { useI18n } from "@/components/i18n/language-provider";
import { TrashIcon } from "@/components/icons";

/**
 * The minus / quantity / plus control that replaces "Add to cart" once a product is in the basket,
 * plus a way to take it out again.
 *
 * <p>Used by both the listing card and the product page so the two cannot drift. It renders nothing
 * when the product is not in the cart — the caller shows its own add button in that case — which keeps
 * the "which one is on screen" decision in one place: {@link useCartLineFor}.
 *
 * <p>Deliberately drives quantity through {@code setQty} rather than {@code addItem}. setQty debounces
 * one PATCH per line and holds the pending value so a server round-trip cannot snap the number back
 * under the user's finger; addItem fires an un-debounced POST per click, so a few taps on plus would
 * be a few requests racing each other.
 */
export function CartQuantityStepper({
  productId,
  productName,
  className = "",
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const { t } = useI18n();
  const { setQty, removeItem } = useCart();
  const line = useCartLineFor(productId);

  if (!line) return null;

  // What the server will actually allow. Null means this product's stock is not tracked, so there is
  // no ceiling — it must never be read as zero, or every untracked product becomes un-incrementable.
  const max = line.availableUnits ?? null;
  const atMax = max !== null && line.qty >= max;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="inline-flex flex-1 items-center justify-between rounded-full border border-border">
        <button
          type="button"
          // Minus at 1 removes the line: setQty(id, 0) delegates to removeItem. That is the behaviour
          // the cart page already has, and it means the control cannot get stuck at a quantity of 1.
          onClick={() => setQty(line.id, line.qty - 1)}
          aria-label={`${t.cart.decrease}: ${productName}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">−</span>
        </button>
        <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-foreground">
          {line.qty}
        </span>
        <button
          type="button"
          onClick={() => setQty(line.id, line.qty + 1)}
          disabled={atMax}
          aria-label={`${t.cart.increase}: ${productName}`}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
      {/* An explicit remove as well as minus-to-zero. Reaching for "take this out" by pressing minus
          repeatedly is not obvious, and the cart page offers both for the same reason. */}
      <button
        type="button"
        onClick={() => removeItem(line.id)}
        aria-label={`${t.cart.remove}: ${productName}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * The active cart line for a product, or null.
 *
 * <p>Three things this has to get right, none of them obvious:
 *
 * <p>It matches on {@code productId} and mutates with {@code line.id}. Those are not the same value —
 * a server line's id is the cart-item id and a guest line's is the product id or a
 * {@code productId::spec.spec} composite — so using one for the other silently edits the wrong line,
 * or nothing.
 *
 * <p>It looks only at {@code items}, never {@code savedItems}. A product parked in save-for-later
 * should keep showing "Add to cart", because that is what addItem does to it: it un-parks the line.
 * Calling setQty on a parked line instead would resurrect it into the order without the customer
 * asking.
 *
 * <p>It prefers the line with no spec configuration. A product page can add the same product several
 * times with different specs, and each is its own line — so "the line for this product" is ambiguous
 * the moment specs are involved. The plain line is the one a listing card creates and the one an
 * unconfigured page view means, so it wins. When every line is configured there is no unambiguous
 * answer, and it falls back to the first: the control stays usable rather than vanishing, and it edits
 * a line the customer can see. Matching a specific configuration would mean comparing the mapped
 * `specs` LABELS (mapServerCart keeps those, though not the option ids), which is not reliable enough
 * to move somebody's basket on.
 */
export function useCartLineFor(productId: string) {
  const { items, ready } = useCart();
  // Before hydration finishes there is no cart to consult, and answering "not in the cart" would
  // flash an Add button that immediately becomes a stepper.
  if (!ready) return null;
  const matches = items.filter((l) => l.productId === productId);
  if (matches.length === 0) return null;
  return matches.find((l) => !l.specs || l.specs.length === 0) ?? matches[0];
}
