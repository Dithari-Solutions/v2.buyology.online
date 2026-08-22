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
  isCancellable,
  type OrderDetail,
  type OrderStatus,
} from "@/lib/account-api";
import { ChevronLeftIcon } from "@/components/icons";

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
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "guest") {
      router.replace(`/login?next=/account/orders/${orderId}`);
      return;
    }
    if (authStatus !== "authed") return;
    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => setMissing(true));
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-4 font-semibold text-foreground">{d.items}</h2>
            <ul className="divide-y divide-border">
              {(order.items ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  {item.productImage ? (
                    // Presigned, short-lived URL — plain <img> on purpose (see stories).
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.productImage}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover"
                    />
                  ) : (
                    <span className="h-14 w-14 shrink-0 rounded-xl bg-surface-2" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {item.productName ?? item.variantSku ?? "—"}
                    </p>
                    <p className="text-xs text-muted" dir="ltr">
                      ×{item.quantity} · {money(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground" dir="ltr">
                    {money(item.totalPrice)}
                  </span>
                </li>
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
                    <div>
                      <p className="font-medium text-foreground">
                        {o.statuses[ev.status] ?? ev.status}
                      </p>
                      {ev.notes && <p className="text-muted">{ev.notes}</p>}
                      {ev.createdAt && (
                        <p className="text-xs text-muted">{dateFmt.format(new Date(ev.createdAt))}</p>
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
            <h2 className="mb-3 font-semibold text-foreground">
              {isPickup ? d.pickup : d.delivery}
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
                  {[order.addressLine1, order.addressLine2, order.city, order.state, order.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </>
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
