"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, type CartLine } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { useI18n } from "@/components/i18n/language-provider";
import { BnplOptions } from "@/components/cart/BnplOptions";
import { RecommendedProducts } from "@/components/cart/RecommendedProducts";
import { getProduct } from "@/lib/products";
import {
  BagIcon,
  ChevronLeftIcon,
  CloseIcon,
  HeartIcon,
  RentIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";

const IMG = "/mock/product-hero.jpg";

/** One rich cart line: image, rating, description, specs, qty + save-for-later. */
function CartRow({ line }: { line: CartLine }) {
  const { t } = useI18n();
  const { removeItem, setQty } = useCart();
  const { has, toggle } = useWishlist();
  // Line ids may carry a "::variant" suffix; product detail keys off the base id.
  const baseId = line.id.split("::")[0];
  const detail = getProduct(baseId);
  const saved = has(baseId);
  const filled = detail ? Math.round(detail.rating) : 0;

  return (
    <li className="flex flex-col gap-4 p-4 sm:flex-row">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-28 sm:w-28">
        <Image src={IMG} alt="" fill sizes="(min-width:640px) 112px, 100vw" className="object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warn dark:text-gold">
              {line.category}
            </p>
            <h2 className="mt-0.5 truncate font-semibold text-foreground">
              {line.name}
            </h2>
            {detail && (
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="flex items-center gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-3.5 w-3.5 ${i < filled ? "text-gold" : "text-border-strong"}`}
                    />
                  ))}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {detail.rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted">
                  · {detail.reviews.toLocaleString()} {t.cart.reviews}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.id)}
            aria-label={`${t.cart.remove}: ${line.name}`}
            className="rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {detail && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">
            {detail.description}
          </p>
        )}

        {detail && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {detail.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-icon"
              >
                {tag}
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {t.cart.inStock}
            </span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                type="button"
                onClick={() => setQty(line.id, line.qty - 1)}
                aria-label={t.cart.decrease}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true">−</span>
              </button>
              <span className="min-w-6 text-center text-sm font-medium tabular-nums text-foreground">
                {line.qty}
              </span>
              <button
                type="button"
                onClick={() => setQty(line.id, line.qty + 1)}
                aria-label={t.cart.increase}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => toggle(baseId)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                saved
                  ? "text-brand"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <HeartIcon
                className={`h-4 w-4 ${saved ? "fill-brand text-brand" : ""}`}
              />
              {saved ? t.cart.saved : t.cart.addToWishlist}
            </button>
          </div>
          <div className="text-end">
            <span className="font-semibold text-foreground">
              ${(line.price * line.qty).toLocaleString()}
            </span>
            {line.qty > 1 && (
              <p className="text-[11px] text-muted" dir="ltr">
                {line.qty} × ${line.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

/** Full cart page contents (items + order summary). Reads the cart store. */
export function CartView() {
  const { t } = useI18n();
  const { items, count, subtotal } = useCart();

  const trust = [
    { icon: TruckIcon, f: t.features.delivery },
    { icon: ShieldCheckIcon, f: t.features.secure },
    { icon: RentIcon, f: t.features.returns },
  ] as const;

  if (items.length === 0) {
    return (
      <>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
            <BagIcon className="h-8 w-8" />
          </span>
          <h1 className="text-2xl font-semibold text-foreground">
            {t.cart.empty}
          </h1>
          <p className="text-muted">{t.cart.emptyHint}</p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t.cart.continueShopping}
          </Link>
        </div>
        <RecommendedProducts />
      </>
    );
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Items */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t.cart.title}
          </h1>
          <p className="mb-5 mt-1 text-sm text-muted">
            {count} {t.header.itemsSuffix}
          </p>

          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {items.map((line) => (
              <CartRow key={line.id} line={line} />
            ))}
          </ul>

          {/* Trust / benefits row */}
          <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {trust.map(({ icon: Icon, f }) => (
              <li
                key={f.label}
                className="flex items-center gap-3 bg-surface px-4 py-3.5"
              >
                <Icon className="h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {f.label}
                  </p>
                  <p className="truncate text-[11px] text-muted">{f.sub}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
            {t.cart.continueShopping}
          </Link>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-40">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t.cart.orderSummary}
          </h2>

          {/* Promo code (mock) */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mb-4 flex gap-2"
          >
            <input
              type="text"
              placeholder={t.cart.promoPlaceholder}
              aria-label={t.cart.promo}
              className="min-w-0 flex-1 rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t.cart.apply}
            </button>
          </form>

          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t.cart.subtotal}</dt>
              <dd className="font-medium text-foreground">
                ${subtotal.toLocaleString()}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t.cart.shipping}</dt>
              <dd className="font-semibold text-warn dark:text-gold">
                {t.cart.free}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">{t.cart.total}</span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              ${subtotal.toLocaleString()}
            </span>
          </div>

          <div className="mt-4">
            <BnplOptions total={subtotal} />
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {t.cart.checkout}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ShieldCheckIcon className="h-4 w-4 text-gold" />
            {t.cart.secure}
          </p>
        </aside>
      </div>

      <RecommendedProducts />
    </>
  );
}
