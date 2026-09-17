"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, type CartLine } from "@/components/cart/cart-provider";
import { useI18n } from "@/components/i18n/language-provider";
import { BnplOptions } from "@/components/cart/BnplOptions";
import { RecommendedProducts } from "@/components/cart/RecommendedProducts";
import { useProductLookup } from "@/lib/use-product-lookup";
import { formatMoney } from "@/lib/format";
import { currentMarket } from "@/lib/market";
import {
  BagIcon,
  ChevronLeftIcon,
  ClockIcon,
  CloseIcon,
  RentIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";

const checkboxCls =
  "h-[18px] w-[18px] shrink-0 rounded border-border accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** One rich cart line: tick-to-buy, image, rating, qty, save-for-later. */
function CartRow({ line, savedRow }: { line: CartLine; savedRow?: boolean }) {
  const { t } = useI18n();
  const { removeItem, setQty, setSelected, saveForLater, moveToCart, fees } = useCart();
  const { product: detail, loading } = useProductLookup(line.productId);
  const name = detail?.name ?? line.name;
  const filled = detail ? Math.round(detail.rating) : 0;
  // Gated on the market's rate, not on the line's amount: a taxed market quotes a rate even where
  // the extracted figure rounds to nothing, and a missing amount is "untaxed/unknown", not zero.
  const vatRate = fees?.vatRatePercent ?? null;

  return (
    <li
      className={`grid items-start gap-3 p-4 sm:flex sm:flex-row sm:items-stretch sm:gap-4 ${
        savedRow ? "grid-cols-[5.5rem_minmax(0,1fr)]" : "grid-cols-[auto_5.5rem_minmax(0,1fr)]"
      }`}
    >
      {!savedRow && (
        <input
          type="checkbox"
          checked={line.selected && line.selectable}
          disabled={!line.selectable}
          onChange={(e) => setSelected(line.id, e.target.checked)}
          aria-label={`${t.cart.selectItem}: ${name}`}
          className={`${checkboxCls} self-center disabled:cursor-not-allowed disabled:opacity-40 sm:mt-11 sm:self-start`}
        />
      )}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl border border-border bg-surface-2 sm:h-28 sm:w-28">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-surface-2 motion-reduce:animate-none" aria-hidden="true" />
        ) : detail?.image?.startsWith("http") ? (
          // Catalogue photo through next/image — contained so the whole product shows.
          <Image src={detail.image} alt={detail.name} fill quality={75} sizes="(min-width: 640px) 112px, 88px" className="bg-white object-contain p-2" />
        ) : (
          // No photo in the catalogue — a quiet placeholder, never a fake product image.
          <span className="absolute inset-0 flex items-center justify-center text-muted" aria-hidden="true">
            <BagIcon className="h-8 w-8 opacity-40" />
          </span>
        )}
      </div>

      {/* On phones this wrapper dissolves into the row's grid: the title block sits beside the
          thumbnail and the rest spans the full width below. */}
      <div className="contents min-w-0 flex-1 flex-col sm:flex">
        <div className="flex items-start justify-between gap-3 self-center sm:self-auto">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warn dark:text-gold">
              {detail?.category || line.category}
            </p>
            {loading && !detail ? (
              <span className="mt-1 block h-5 w-2/3 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" aria-hidden="true" />
            ) : (
              <h2 className="mt-0.5 line-clamp-2 font-semibold leading-snug! text-foreground sm:block sm:truncate sm:leading-[1.04]!">
                {name}
              </h2>
            )}
            {line.specs && line.specs.length > 0 && (
              <p className="mt-0.5 text-xs text-muted">{line.specs.join(" · ")}</p>
            )}
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
                <span className="hidden text-xs text-muted sm:inline">
                  · {detail.reviews.toLocaleString()} {t.cart.reviews}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.id)}
            aria-label={`${t.cart.remove}: ${name}`}
            className="-m-2 rounded-md p-3 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:m-0 sm:p-1"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {detail && (
          <p className="col-span-full line-clamp-2 text-sm text-muted sm:mt-2">
            {detail.description}
          </p>
        )}

        {detail && (
          <div className="col-span-full flex flex-wrap items-center gap-1.5 sm:mt-2.5">
            {detail.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-icon"
              >
                {tag}
              </span>
            ))}
            {detail.inStock !== false && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {t.cart.inStock}
              </span>
            )}
          </div>
        )}

        {/* Tighter phone gaps keep the price beside the 40px controls instead of wrapping below them. */}
        <div className="col-span-full flex flex-wrap items-center justify-between gap-x-2 gap-y-3 border-t border-border pt-3 sm:mt-4 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                type="button"
                onClick={() => setQty(line.id, line.qty - 1)}
                aria-label={`${t.cart.decrease}: ${name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-8 sm:w-8"
              >
                <span aria-hidden="true">−</span>
              </button>
              <span className="min-w-6 text-center text-sm font-medium tabular-nums text-foreground">
                {line.qty}
              </span>
              {/* Stops at what the server will actually accept. null means this product's stock is
                  not tracked, so there is no ceiling — reading it as 0 would make every untracked
                  product un-incrementable. Without this the stepper counted freely to MAX_QTY and the
                  customer learned the limit from a rejected request. */}
              <button
                type="button"
                onClick={() => setQty(line.id, line.qty + 1)}
                disabled={line.availableUnits != null && line.qty >= line.availableUnits}
                aria-label={`${t.cart.increase}: ${name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 sm:h-8 sm:w-8"
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
            {savedRow ? (
              <button
                type="button"
                onClick={() => moveToCart(line.id)}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-3 text-xs font-semibold text-brand-icon transition-colors hover:bg-primary hover:text-primary-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:py-1.5"
              >
                <BagIcon className="h-4 w-4" />
                {t.cart.moveToCart}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => saveForLater(line.id)}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-3 text-xs font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5 sm:py-1.5"
              >
                <ClockIcon className="h-4 w-4" />
                {t.cart.addToWishlist}
              </button>
            )}
          </div>
          <div className="ms-auto text-end">
            <span className="font-semibold text-foreground" dir="ltr">
              {formatMoney(line.price * line.qty, line.currency)}
            </span>
            {line.originalPrice != null && line.originalPrice > line.price && (
              <p className="text-[11px] text-muted line-through" dir="ltr">
                {formatMoney(line.originalPrice * line.qty, line.currency)}
              </p>
            )}
            {line.qty > 1 && (
              <p className="text-[11px] text-muted" dir="ltr">
                {line.qty} × {formatMoney(line.price, line.currency)}
              </p>
            )}
            {/* The tax already INSIDE this price, named for the shopper — never added to it. Each
                line is rounded on its own, so these deliberately do not read as a sum of the
                summary's VAT row, which is extracted from goods plus delivery. */}
            {vatRate != null && line.vatAmount != null && (
              <p className="mt-0.5 text-[11px] text-muted">
                {t.cart.vatIncluded.replace("{rate}", String(vatRate))}{" "}
                <span dir="ltr">({formatMoney(line.vatAmount, line.currency)})</span>
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
  const {
    items,
    savedItems,
    count,
    subtotal,
    selectedCount,
    currency,
    fees,
    setAllSelected,
    syncing,
    ready,
    syncError,
    syncErrorMessage,
  } = useCart();

  const trust = [
    { icon: TruckIcon, f: t.features.delivery },
    { icon: ShieldCheckIcon, f: t.features.secure },
    { icon: RentIcon, f: t.features.returns },
  ] as const;

  if (!ready && items.length === 0 && savedItems.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]" aria-busy>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
      </div>
    );
  }

  if (items.length === 0 && savedItems.length === 0) {
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

  // The backend prices ONLY selected lines; delivery figures are server-computed and null
  // while unknown (guest mode, FX failure). "Free" is only claimed when the server says so.
  const shippingKnown = fees != null && fees.deliveryFee != null;
  const shippingFree =
    fees?.qualifiesForFreeShipping === true || (shippingKnown && fees.deliveryFee === 0);
  const shippingFee = shippingKnown && !shippingFree ? fees.deliveryFee! : 0;
  // VAT is DISPLAYED but never added: catalogue prices already contain it, so the total is goods
  // plus delivery and this figure is how much of that total IS tax. Gated on the rate — which the
  // server sends whenever the market is taxed, even for an empty basket — and not on the amount,
  // so a zero-value cart still says what the rate is instead of hiding the row.
  const vatRate = fees?.vatRatePercent ?? null;
  const vatAmount = fees?.vatAmount ?? 0;
  // The server's own total wins whenever it sent one — it is the figure the order will carry.
  const total = fees?.estimatedTotal ?? subtotal + shippingFee;

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Items */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t.cart.title}
          </h1>
          <p className="mb-5 mt-1 text-sm text-muted">
            {count} {t.header.itemsSuffix}
          </p>

          {syncError && (
            <p className="mb-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-warn dark:text-gold" role="status">
              {/* The server's own wording when it gave one — a refused purchase is something the
                  shopper can act on, and "something went wrong" tells them only that we will not
                  say what. Falls back to the generic note for failures with nothing to report. */}
              {syncErrorMessage ?? t.cart.syncErrorNote}
            </p>
          )}
          {items.length > 0 && (
            <>
              <div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={selectedCount === items.length && items.length > 0}
                    ref={(el) => {
                      if (el) el.indeterminate = selectedCount > 0 && selectedCount < items.length;
                    }}
                    onChange={(e) => setAllSelected(e.target.checked)}
                    className={checkboxCls}
                  />
                  {t.cart.selectAll}
                </label>
                <span className="text-sm text-muted">
                  {selectedCount}/{items.length} {t.cart.selectedSuffix}
                </span>
              </div>

              <ul
                className={`divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface transition-opacity ${
                  syncing ? "opacity-70" : ""
                }`}
                aria-busy={syncing || undefined}
              >
                {items.map((line) => (
                  <CartRow key={line.id} line={line} />
                ))}
              </ul>
            </>
          )}

          {items.length === 0 && savedItems.length > 0 && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
                <BagIcon className="h-6 w-6" />
              </span>
              <p className="font-semibold text-foreground">{t.cart.empty}</p>
              <p className="text-sm text-muted">{t.cart.emptyHint}</p>
            </div>
          )}

          {/* Saved for later — unticked on the server: not priced, not shipped, survives checkout */}
          {savedItems.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <ClockIcon className="h-5 w-5 text-gold" />
                {t.cart.savedForLater}
                <span className="text-sm font-normal text-muted">({savedItems.length})</span>
              </h2>
              <ul
                className={`divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface transition-opacity ${
                  syncing ? "opacity-70" : ""
                }`}
                aria-busy={syncing || undefined}
              >
                {savedItems.map((line) => (
                  <CartRow key={line.id} line={line} savedRow />
                ))}
              </ul>
            </section>
          )}

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
            className="mt-2 inline-flex items-center gap-1 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground sm:mt-4 sm:py-0"
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

          {/* Promo code (validated at order time — wired in the checkout step) */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mb-4 flex gap-2"
          >
            <input
              type="text"
              placeholder={t.cart.promoPlaceholder}
              aria-label={t.cart.promo}
              className="min-w-0 flex-1 rounded-full border border-border bg-surface-2 px-4 py-2 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring sm:text-sm"
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
              <dt className="text-muted">
                {t.cart.subtotal}
                {items.length > 0 && (
                  <span className="text-xs"> · {selectedCount}/{items.length}</span>
                )}
              </dt>
              <dd className="font-medium text-foreground" dir="ltr">
                {formatMoney(subtotal, currency)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">{t.cart.shipping}</dt>
              {shippingFree ? (
                <dd className="font-semibold text-warn dark:text-gold">
                  {t.cart.free}
                </dd>
              ) : shippingKnown ? (
                <dd className="font-medium text-foreground" dir="ltr">
                  {formatMoney(shippingFee, currency)}
                </dd>
              ) : (
                <dd className="text-muted">{t.cart.shippingAtCheckout}</dd>
              )}
            </div>
            {vatRate != null && (
              <div className="flex items-center justify-between">
                <dt className="text-muted">{t.cart.vat.replace("{rate}", String(vatRate))}</dt>
                <dd className="font-medium text-foreground" dir="ltr">
                  {formatMoney(vatAmount, currency)}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-semibold text-foreground">{t.cart.total}</span>
            <span className="text-xl font-bold tracking-tight text-foreground" dir="ltr">
              {formatMoney(total, currency)}
            </span>
          </div>

          <div className="mt-4">
            <BnplOptions total={total} currency={currency} />
          </div>

          {!currentMarket().paymentsEnabled ? (
            <p className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-center text-sm text-muted">
              {t.cart.paymentsSoon}
            </p>
          ) : selectedCount === 0 ? (
            <button
              type="button"
              disabled
              className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg opacity-50 disabled:cursor-not-allowed"
            >
              {t.cart.checkout}
            </button>
          ) : (
            <Link
              href="/checkout"
              className="mt-4 block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {t.cart.checkout}
            </Link>
          )}
          {selectedCount === 0 && items.length > 0 && (
            <p className="mt-2 text-center text-xs text-muted">{t.cart.noneSelected}</p>
          )}
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
