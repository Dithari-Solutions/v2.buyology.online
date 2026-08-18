"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/cart-provider";
import { useI18n } from "@/components/i18n/language-provider";
import { BnplOptions } from "@/components/cart/BnplOptions";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { BagIcon, CloseIcon } from "@/components/icons";

const SHARED_IMG = "/mock/product-hero.jpg";

/**
 * Cart drawer — a slide-over pinned to the right showing the cart contents,
 * subtotal, a "Go to cart" button, and a close control. Opens when an item is
 * added or the header cart is clicked.
 */
export function CartDrawer() {
  const { t } = useI18n();
  const { items, count, subtotal, isOpen, close, removeItem, setQty } =
    useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const unlock = lockBodyScroll();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      unlock();
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, close]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Tab") return;
    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110]"
      role="dialog"
      aria-modal="true"
      aria-label={t.cart.title}
    >
      <div
        className="buyo-overlay absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      <div
        ref={panelRef}
        onKeyDown={onKeyDown}
        className="buyo-drawer absolute right-0 top-0 flex h-full w-[380px] max-w-full flex-col border-l border-border bg-elevated shadow-[var(--shadow-overlay)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {t.cart.title}
            {count > 0 && (
              <span className="ms-1 font-normal text-muted">({count})</span>
            )}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={t.cart.close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
              <BagIcon className="h-7 w-7" />
            </span>
            <p className="font-semibold text-foreground">{t.cart.empty}</p>
            <p className="text-sm text-muted">{t.cart.emptyHint}</p>
            <button
              type="button"
              onClick={close}
              className="mt-1 text-sm font-semibold text-warn hover:opacity-80 dark:text-gold"
            >
              {t.cart.continueShopping}
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
              {items.map((line) => (
                <li
                  key={line.id}
                  className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    <Image
                      src={SHARED_IMG}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium text-foreground">
                      {line.name}
                    </p>
                    <p className="text-xs text-muted">{line.category}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty - 1)}
                          aria-label={t.cart.decrease}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span aria-hidden="true">−</span>
                        </button>
                        <span className="min-w-5 text-center text-sm font-medium tabular-nums text-foreground">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.id, line.qty + 1)}
                          aria-label={t.cart.increase}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span aria-hidden="true">+</span>
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ${(line.price * line.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.id)}
                    aria-label={`${t.cart.remove}: ${line.name}`}
                    className="self-start rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="border-t border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted">{t.cart.subtotal}</span>
                <span className="text-lg font-bold text-foreground">
                  ${subtotal.toLocaleString()}
                </span>
              </div>
              <div className="mb-3">
                <BnplOptions total={subtotal} compact />
              </div>
              <Link
                href="/cart"
                onClick={close}
                className="flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-elevated"
              >
                {t.cart.goToCart}
              </Link>
              <button
                type="button"
                onClick={close}
                className="mt-2 w-full text-center text-sm text-muted transition-colors hover:text-foreground"
              >
                {t.cart.continueShopping}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
