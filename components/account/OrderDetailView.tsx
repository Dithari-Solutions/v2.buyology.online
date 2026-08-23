"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";
import {
  cancelOrder,
  fetchOrder,
  fetchPaymentTransaction,
  isCancellable,
  type OrderDetail,
  type OrderItem,
  type OrderStatus,
  type PaymentInfo,
} from "@/lib/account-api";
import { useProductLookup } from "@/lib/use-product-lookup";
import { repayOrder } from "@/lib/checkout-api";
import { currentMarket } from "@/lib/market";
import { TabbyLogo, TamaraLogo } from "@/components/cart/payment-logos";
import { RefundCard } from "@/components/account/RefundCard";
import { PENDING_ORDER_KEY, PENDING_TX_KEY } from "@/components/checkout/CheckoutView";
import { ChevronLeftIcon, StarIcon, TruckIcon, WalletIcon } from "@/components/icons";

/**
 * One purchased line: the order's own snapshot (name, image, price locked at purchase)
 * upgraded progressively with live catalogue data — category, rating, and a link to the
 * product's page — resolved by product id, exactly like cart rows.
 */
function OrderItemRow({
  item,
  money,
  reviewsLabel,
}: {
  item: OrderItem;
  money: (n: number | null | undefined) => string | null;
  reviewsLabel: string;
}) {
  const { product: detail } = useProductLookup(item.productId ?? null);
  const name = item.productName ?? detail?.name ?? item.variantSku ?? item.productSku ?? "—";
  const image = item.productImage ?? (detail?.image?.startsWith("http") ? detail.image : null);
  const sku = item.variantSku ?? item.productSku ?? detail?.slug ?? null;
  const filled = detail ? Math.round(detail.rating) : 0;

  const body = (
    <>
      {image ? (
        // Presigned, short-lived URL — plain <img> on purpose (see stories).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl border border-border bg-white object-contain p-1.5"
        />
      ) : (
        <span className="h-20 w-20 shrink-0 rounded-xl border border-border bg-surface-2" />
      )}
      <div className="min-w-0 flex-1">
        {detail?.category && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-warn dark:text-gold">
            {detail.category}
          </p>
        )}
        <p className="truncate font-medium text-foreground">{name}</p>
        {sku && (
          <p className="text-xs text-muted" dir="ltr">
            {sku}
          </p>
        )}
        {detail && detail.reviews > 0 && (
          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-3 w-3 ${i < filled ? "text-gold" : "text-border-strong"}`}
                />
              ))}
            </span>
            {detail.rating.toFixed(1)} · {detail.reviews.toLocaleString()} {reviewsLabel}
          </span>
        )}
        <p className="mt-0.5 text-xs text-muted" dir="ltr">
          ×{item.quantity} · {money(item.unitPrice)}
        </p>
      </div>
      <span className="self-center text-sm font-semibold text-foreground" dir="ltr">
        {money(item.totalPrice)}
      </span>
    </>
  );

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      {item.productId ? (
        <Link
          href={`/product/${item.productId}`}
          className="flex items-start gap-4 rounded-xl transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-start gap-4">{body}</div>
      )}
    </li>
  );
}

function statusTone(status: OrderStatus): string {
  if (status === "DELIVERED") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (status === "CANCELLED" || status === "FAILED") return "bg-surface-2 text-muted";
  if (status === "PENDING_PAYMENT") return "bg-gold/15 text-warn dark:text-gold";
  return "bg-brand-soft text-brand-icon";
}

/** One order, in full: items, delivery, money, history. Guarded like the account page. */
export function OrderDetailView({ orderId }: { orderId: string }) {
  const { t, locale } = useI18n();
  const o = t.account.orders;
  const d = o.detail;
  const { status: authStatus } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [missing, setMissing] = useState(false);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "guest") {
      router.replace(`/login?next=/account/orders/${orderId}`);
      return;
    }
    if (authStatus !== "authed") return;
    let cancelled = false;
    fetchOrder(orderId)
      .then((res) => {
        if (cancelled) return;
        setOrder(res);
        // What paid for it — shown when the gateway told us; silently absent otherwise.
        if (res.paymentTransactionId) {
          fetchPaymentTransaction(res.paymentTransactionId)
            .then((tx) => {
              // A FAILED order points at its declined attempt — that never "paid for" the
              // order. Refunded states did: the payment happened, then came back.
              const settled = ["SUCCESS", "REFUNDED", "PARTIALLY_REFUNDED"];
              if (!cancelled && settled.includes(tx.status ?? "")) setPayment(tx);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, orderId, router]);

  async function onCancel() {
    setBusy(true);
    setError(null);
    try {
      await cancelOrder(orderId);
      setOrder(await fetchOrder(orderId));
    } catch (err) {
      setError(
        err instanceof AuthError && err.message && err.status !== 0
          ? `${o.failed}: ${err.message}`
          : t.auth.errors.generic,
      );
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  if (missing) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted">{d.notFound}</p>
        <Link href="/account" className="mt-4 inline-block font-semibold text-brand-icon hover:underline">
          {d.back}
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4" aria-busy>
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
      </div>
    );
  }

  // Proof URLs are presigned with a short TTL; a tab left open outlives them. The link
  // pre-opens a tab synchronously (popup blockers), refetches the order for fresh URLs,
  // then navigates the tab — falling back to the possibly-stale URL if the refetch fails.
  async function openProof(eventId: string, fallbackUrl: string, e: React.MouseEvent) {
    e.preventDefault();
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;
    let url = fallbackUrl;
    try {
      const fresh = await fetchOrder(orderId);
      setOrder(fresh);
      url = fresh.trackingHistory?.find((x) => x.id === eventId)?.proofImageUrl ?? fallbackUrl;
    } catch {
      /* stale URL is still worth a try */
    }
    if (tab) tab.location.href = url;
    else window.open(url, "_blank", "noopener");
  }

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  const shortId = order.id.slice(0, 8).toUpperCase();
  const currency = order.currency ?? "";
  const money = (n: number | null | undefined) =>
    n == null ? null : `${currency} ${n.toFixed(2)}`;
  const statusLabel = o.statuses[order.status] ?? order.status;
  const isPickup = order.deliveryMethod === "PICKUP";

  return (
    <div>
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
        {d.back}
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" dir="ltr">
          {d.heading} BUY-{shortId}
        </h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(order.status)}`}>
          {statusLabel}
        </span>
        <span className="ms-auto text-sm text-muted">
          {o.placedOn} {dateFmt.format(new Date(order.createdAt))}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted" dir="ltr">
        {order.id}
      </p>

      {order.status === "PENDING_PAYMENT" && currentMarket().paymentsEnabled && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <p className="text-sm text-muted">{o.statuses.PENDING_PAYMENT}</p>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            {(["CARD", "TABBY", "TAMARA"] as const).map((m) => (
              <button
                key={m}
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError(null);
                  try {
                    const pay = await repayOrder(order.id, {
                      methodType: m,
                      redirectionUrl: `${window.location.origin}/payment/callback`,
                    });
                    if (!pay.checkoutUrl) throw new Error("no checkout url");
                    try {
                      sessionStorage.setItem(PENDING_TX_KEY, pay.transactionId);
                      sessionStorage.setItem(PENDING_ORDER_KEY, order.id);
                    } catch { /* callback falls back to params */ }
                    window.location.href = pay.checkoutUrl;
                  } catch {
                    setError(t.checkout.placeFailed);
                    setBusy(false);
                  }
                }}
                className={
                  m === "CARD"
                    ? "rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    : "rounded-full border border-border px-4 py-2 transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60"
                }
              >
                {m === "CARD" ? (
                  busy ? t.auth.loading : t.checkout.payNow
                ) : m === "TABBY" ? (
                  <TabbyLogo className="h-[16px] w-auto" />
                ) : (
                  <TamaraLogo className="h-[16px] w-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {order.cancellationReason && (
        <p className="mt-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
          {order.cancellationReason}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 font-semibold text-foreground">{d.items}</h2>
            <ul className="divide-y divide-border">
              {(order.items ?? []).map((item) => (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  money={money}
                  reviewsLabel={t.cart.reviews}
                />
              ))}
            </ul>
          </section>

          {/* History */}
          {(order.trackingHistory?.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-4 font-semibold text-foreground">{d.timeline}</h2>
              <ol className="space-y-3">
                {order.trackingHistory!.map((ev) => (
                  <li key={ev.id} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {o.statuses[ev.status] ?? ev.status}
                      </p>
                      {ev.notes && <p className="text-muted">{ev.notes}</p>}
                      {ev.locationDescription && (
                        <p className="text-xs text-muted">{ev.locationDescription}</p>
                      )}
                      {ev.createdAt && (
                        <p className="text-xs text-muted">{dateFmt.format(new Date(ev.createdAt))}</p>
                      )}
                      {ev.proofImageUrl && (
                        // The courier's pickup/delivery photo — presigned, short-lived URL.
                        <a
                          href={ev.proofImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => openProof(ev.id, ev.proofImageUrl!, e)}
                          className="mt-2 block w-fit rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ev.proofImageUrl}
                            alt=""
                            className="h-28 w-40 rounded-xl border border-border object-cover"
                            loading="lazy"
                          />
                          <span className="mt-1 block text-xs font-medium text-brand-icon">
                            {d.proofPhoto}
                          </span>
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {/* Summary */}
          <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
            <h2 className="mb-4 font-semibold text-foreground">{d.summary}</h2>
            <dl className="space-y-2">
              {order.subtotal != null && (
                <div className="flex justify-between">
                  <dt className="text-muted">{d.subtotal}</dt>
                  <dd dir="ltr">{money(order.subtotal)}</dd>
                </div>
              )}
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <dt>{d.discount}{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                  <dd dir="ltr">-{money(order.discount)}</dd>
                </div>
              )}
              {order.shippingFee != null && (
                <div className="flex justify-between">
                  <dt className="text-muted">{d.shipping}</dt>
                  <dd dir="ltr">{money(order.shippingFee)}</dd>
                </div>
              )}
              {(order.creditApplied ?? 0) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">{d.credit}</dt>
                  <dd dir="ltr">-{order.creditCurrency ?? currency} {order.creditApplied!.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                <dt>{d.total}</dt>
                <dd dir="ltr">{money(order.totalAmount)}</dd>
              </div>
            </dl>
          </section>

          {/* Delivery / pickup */}
          <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
            <h2 className="mb-3 flex flex-wrap items-center gap-2 font-semibold text-foreground">
              {isPickup ? d.pickup : d.delivery}
              {order.deliveryMethod && !isPickup && (
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-icon">
                  {order.deliveryMethod === "EXPRESS"
                    ? d.methodExpress
                    : order.deliveryMethod === "INTERNATIONAL"
                      ? d.methodInternational
                      : d.methodRegular}
                </span>
              )}
            </h2>
            {isPickup ? (
              <>
                <p className="font-medium text-foreground">{order.pickupStoreName}</p>
                <p className="text-muted">{order.pickupStoreAddress}</p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wide text-muted">{d.recipient}</p>
                <p className="mt-1 font-medium text-foreground">
                  {[order.recipientFirstName, order.recipientLastName].filter(Boolean).join(" ")}
                </p>
                {order.recipientPhone && <p className="text-muted" dir="ltr">{order.recipientPhone}</p>}
                <p className="mt-2 text-muted">
                  {[
                    order.addressLine1,
                    order.addressLine2,
                    order.city,
                    order.state,
                    order.postalCode,
                    order.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </>
            )}
            {(order.customerEmail || order.customerPhone) && (
              <>
                <p className="mt-3 text-xs uppercase tracking-wide text-muted">{d.contact}</p>
                {order.customerEmail && (
                  <p className="mt-1 text-muted" dir="ltr">{order.customerEmail}</p>
                )}
                {order.customerPhone && (
                  <p className="text-muted" dir="ltr">{order.customerPhone}</p>
                )}
              </>
            )}
            {(order.shippedAt || order.deliveredAt) && (
              <div className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-muted">
                {order.shippedAt && (
                  <p>
                    {d.shippedOn} {dateFmt.format(new Date(order.shippedAt))}
                  </p>
                )}
                {order.deliveredAt && (
                  <p>
                    {d.deliveredOn} {dateFmt.format(new Date(order.deliveredAt))}
                  </p>
                )}
              </div>
            )}
            {order.estimatedDeliveryTime && (
              <p className="mt-3 text-xs text-muted">
                {d.eta}: {order.estimatedDeliveryTime}
              </p>
            )}
            {order.trackingCode &&
              (order.trackingCode.startsWith("http") ? (
                <a
                  href={order.trackingCode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block font-medium text-brand-icon hover:underline"
                >
                  {o.track}
                </a>
              ) : (
                <p className="mt-3 text-muted" dir="ltr">
                  {order.carrierName ? `${order.carrierName}: ` : ""}
                  {order.trackingCode}
                </p>
              ))}
          </section>

          {/* Payment — shown only when we positively know what paid: a settled gateway
              transaction, or a fully-credit-settled order (which has no transaction at all).
              A card order whose transaction can't be read shows nothing rather than a guess. */}
          {(() => {
            const creditSettled =
              (order.creditApplied ?? 0) > 0 && !order.paymentTransactionId;
            if (!payment && !creditSettled) return null;
            return (
              <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                  <WalletIcon className="h-4 w-4 text-gold" />
                  {d.payment}
                </h2>
                {payment?.methodType === "CARD" ? (
                  <p className="font-medium text-foreground" dir="ltr">
                    {payment.cardBrand ?? d.methodCard}
                    {payment.cardLast4 ? ` •••• ${payment.cardLast4}` : ""}
                  </p>
                ) : payment?.methodType === "TABBY" ? (
                  <p className="font-medium text-foreground">{d.methodTabby}</p>
                ) : payment?.methodType === "TAMARA" ? (
                  <p className="font-medium text-foreground">{d.methodTamara}</p>
                ) : creditSettled || payment?.methodType === "B2B_CREDIT" ? (
                  <p className="font-medium text-foreground">{d.methodCredit}</p>
                ) : null}
                {(order.creditApplied ?? 0) > 0 && !creditSettled && payment != null && (
                  <p className="mt-1 text-muted">{d.credit}</p>
                )}
                {order.paidAt && (
                  <p className="mt-1 text-xs text-muted">
                    {dateFmt.format(new Date(order.paidAt))}
                  </p>
                )}
              </section>
            );
          })()}

          {/* Courier */}
          {order.courierName && (
            <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                <TruckIcon className="h-4 w-4 text-gold" />
                {d.courier}
              </h2>
              <p className="font-medium text-foreground">{order.courierName}</p>
              {order.courierPhone && (
                <a
                  href={`tel:${order.courierPhone}`}
                  className="text-brand-icon hover:underline"
                  dir="ltr"
                >
                  {order.courierPhone}
                </a>
              )}
            </section>
          )}

          {/* Refund */}
          <RefundCard
            orderId={order.id}
            orderStatus={order.status}
            deliveredAt={order.deliveredAt}
            currency={order.currency}
            hasPaymentTransaction={!!order.paymentTransactionId}
          />

          {/* Cancel */}
          {isCancellable(order.status) && (
            <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
              {confirming ? (
                <div className="space-y-3">
                  <p className="text-muted">{o.cancelConfirm}</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onCancel}
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                    >
                      {busy ? t.auth.loading : o.cancelOrder}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="font-medium text-muted hover:text-foreground"
                    >
                      {o.cancelKeep}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="font-medium text-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
                >
                  {o.cancelOrder}
                </button>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
