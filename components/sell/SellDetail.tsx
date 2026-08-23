"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";
import { formatMoney } from "@/lib/format";
import {
  chooseSellDelivery,
  chooseSellReturn,
  fetchSellRequest,
  fetchSellStores,
  respondToSellOffer,
  type SellRequest,
  type SellStore,
} from "@/lib/sell-api";
import { sellStatusTone } from "@/components/sell/MySells";
import { PENDING_ORDER_KEY, PENDING_TX_KEY } from "@/components/checkout/CheckoutView";
import { ChevronLeftIcon, SparklesIcon, TruckIcon, WrenchIcon } from "@/components/icons";

const card = "rounded-2xl border border-border bg-surface p-5";
const primaryBtn =
  "rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const secondaryBtn =
  "rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * One sell, tracked and acted on. The status decides which action card shows: choose (or
 * change) how the device reaches us while it hasn't; pay a pending courier fee; answer the
 * team's binding quote; choose the way back after declining. The AI estimate is advisory
 * and arrives asynchronously — this page polls for it briefly after submission.
 */
export function SellDetail({ sellId }: { sellId: string }) {
  const { t, locale } = useI18n();
  const r = t.sell;
  const d = r.detail;
  const router = useRouter();
  const { status: authStatus } = useAuth();

  const [sell, setSell] = useState<SellRequest | null>(null);
  const [missing, setMissing] = useState(false);
  const [stores, setStores] = useState<SellStore[] | null>(null);
  const [storeId, setStoreId] = useState<string>("");
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "guest") router.replace(`/login?next=/sell/${sellId}`);
    if (authStatus !== "authed") return;
    let cancelled = false;
    fetchSellRequest(sellId)
      .then((res) => {
        if (!cancelled) setSell(res);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, sellId, router]);

  // The AI estimate lands seconds after submission — poll briefly while it's absent.
  const pollsRef = useRef(0);
  const [pollsDone, setPollsDone] = useState(false);
  const [pollTick, setPollTick] = useState(0);
  const awaitingEstimate =
    sell != null &&
    !sell.aiEstimatedAt &&
    (sell.status === "SUBMITTED" || sell.status === "AWAITING_DEVICE");
  useEffect(() => {
    if (!awaitingEstimate || pollsDone) return;
    const timer = setTimeout(async () => {
      pollsRef.current += 1;
      if (pollsRef.current >= 20) setPollsDone(true);
      try {
        const fresh = await fetchSellRequest(sellId);
        setSell(fresh);
      } catch {
        // A failed poll must still re-arm the next one — bump a tick so the effect re-fires.
        setPollTick((n) => n + 1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [awaitingEstimate, sell, sellId, pollsDone, pollTick]);

  const needStores =
    editingDelivery ||
    (sell != null &&
      (sell.status === "SUBMITTED" || sell.status === "DECLINED") &&
      !sell.inboundDeliveryMethod);
  useEffect(() => {
    if (!needStores || stores !== null) return;
    let cancelled = false;
    fetchSellStores()
      .then((list) => {
        if (!cancelled) setStores(list);
      })
      .catch(() => {
        if (!cancelled) setStores([]);
      });
    return () => {
      cancelled = true;
    };
  }, [needStores, stores]);

  const run = useCallback(
    async (key: string, action: () => Promise<SellRequest | { sellRequest: SellRequest; payment: { transactionId: string; checkoutUrl?: string | null } | null }>) => {
      if (busy) return;
      setBusy(key);
      setError(null);
      try {
        const res = await action();
        if ("sellRequest" in res) {
          if (res.payment?.checkoutUrl) {
            try {
              sessionStorage.setItem(PENDING_TX_KEY, res.payment.transactionId);
              sessionStorage.removeItem(PENDING_ORDER_KEY);
            } catch {
              /* callback falls back to params */
            }
            window.location.href = res.payment.checkoutUrl;
            return; // leaving the page — keep busy
          }
          setSell(res.sellRequest);
        } else {
          setSell(res);
        }
        setEditingDelivery(false);
      } catch (err) {
        setError(
          err instanceof AuthError && (err.status === 400 || err.status === 409) && err.message
            ? err.message
            : d.actionFailed,
        );
      } finally {
        setBusy(null);
      }
    },
    [busy, d.actionFailed],
  );

  if (missing) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted">{d.notFound}</p>
        <Link href="/sell/my" className="mt-4 inline-block font-semibold text-brand-icon hover:underline">
          {d.backToList}
        </Link>
      </div>
    );
  }
  if (!sell) {
    return (
      <div className="space-y-4" aria-busy>
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const feeLabel =
    sell.courierFeeAmount != null
      ? formatMoney(sell.courierFeeAmount, sell.courierFeeCurrency ?? "AED")
      : null;
  const canChangeInbound = sell.status === "SUBMITTED" || sell.status === "AWAITING_DEVICE";
  const inboundCourierPending =
    sell.status === "SUBMITTED" &&
    sell.inboundDeliveryMethod === "COURIER_PICKUP" &&
    !sell.courierFeePaid;
  const returnCourierPending =
    sell.status === "DECLINED" &&
    sell.returnDeliveryMethod === "COURIER_RETURN" &&
    !sell.courierFeePaid;
  const redirectionUrl = () =>
    `${window.location.origin}/payment/callback?kind=sell-courier-fee&sellId=${sellId}`;

  const infoStrip =
    sell.status === "SUBMITTED" && !sell.inboundDeliveryMethod
      ? d.reviewing
      : sell.status === "AWAITING_DEVICE"
        ? sell.inboundDeliveryMethod === "COURIER_PICKUP"
          ? d.awaitingCourier
          : d.awaitingDropoff.replace("{{store}}", sell.storeBranchName ?? d.theStore)
        : sell.status === "UNDER_REVIEW"
          ? d.underReview
          : sell.status === "ACCEPTED"
            ? sell.storeBranchName
              ? d.collectBody.replace("{{store}}", sell.storeBranchName)
              : d.collectBodyNoStore
            : sell.status === "COMPLETED"
              ? d.completed
              : null;

  const deliveryPicker = (kind: "inbound" | "return") => (
    <div className="space-y-3">
      <button
        type="button"
        disabled={busy != null}
        onClick={() => {
          if (kind === "inbound") {
            if (!storeId) {
              setError(d.pickStore);
              return;
            }
            void run("dropoff", () =>
              chooseSellDelivery(sellId, { method: "STORE_DROPOFF", storeLocationId: storeId }),
            );
          } else {
            void run("pickup-store", () => chooseSellReturn(sellId, { method: "STORE_PICKUP" }));
          }
        }}
        className="w-full rounded-xl border border-border p-4 text-start transition-colors hover:border-border-strong disabled:opacity-60"
      >
        <span className="flex items-center justify-between gap-2">
          <span className="font-semibold text-foreground">
            {kind === "inbound" ? d.bringToStore : d.pickupFromStore}
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            {d.free}
          </span>
        </span>
        {kind === "inbound" && (
          <span className="mt-1 block text-sm text-muted">{d.bringToStoreBody}</span>
        )}
      </button>
      {kind === "inbound" &&
        (stores === null ? (
          <div className="h-10 animate-pulse rounded-xl border border-border bg-surface-2 motion-reduce:animate-none" aria-busy />
        ) : stores.length === 0 ? (
          <p className="text-sm text-muted">{d.noStores}</p>
        ) : (
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            aria-label={d.selectStore}
            className="w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{d.selectStore}</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {[s.branchName, s.city].filter(Boolean).join(" — ")}
              </option>
            ))}
          </select>
        ))}
      <button
        type="button"
        disabled={
          busy != null ||
          (kind === "inbound" &&
            sell.inboundDeliveryMethod === "COURIER_PICKUP" &&
            sell.courierFeePaid === true)
        }
        onClick={() =>
          kind === "inbound"
            ? void run("courier", () =>
                chooseSellDelivery(sellId, {
                  method: "COURIER_PICKUP",
                  redirectionUrl: redirectionUrl(),
                }),
              )
            : void run("courier-return", () =>
                chooseSellReturn(sellId, {
                  method: "COURIER_RETURN",
                  redirectionUrl: redirectionUrl(),
                }),
              )
        }
        className="w-full rounded-xl border border-border p-4 text-start transition-colors hover:border-border-strong disabled:opacity-60"
      >
        <span className="flex items-center gap-2 font-semibold text-foreground">
          <TruckIcon className="h-4 w-4 text-gold" />
          {kind === "inbound" ? d.courierPickup : d.courierReturn}
        </span>
        <span className="mt-1 block text-sm text-muted">
          {kind === "inbound" ? d.courierPickupBody : d.returnCourierChosen}
          {feeLabel ? (
            <>
              {" "}
              <span dir="ltr">({feeLabel})</span>
            </>
          ) : null}
        </span>
      </button>
      {busy != null && <p className="text-sm text-muted">{d.saving}</p>}
    </div>
  );

  return (
    <div>
      <Link href="/sell/my" className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground">
        <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
        {d.backToList}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" dir="ltr">
          {sell.reference ?? sell.id.slice(0, 8)}
        </h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sellStatusTone(sell.status)}`}>
          {r.statuses[sell.status] ?? sell.status}
        </span>
        {sell.createdAt && (
          <span className="ms-auto text-sm text-muted">
            {d.dateSubmitted}: {dateFmt.format(new Date(sell.createdAt))}
          </span>
        )}
      </div>

      {infoStrip && (
        <p className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
          {infoStrip}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* Device */}
          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <WrenchIcon className="h-4 w-4 text-gold" />
              {sell.productName}
            </h2>
            <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 sm:justify-start">
                <dt className="text-muted">{d.brand}:</dt>
                <dd className="font-medium text-foreground">{sell.brand}</dd>
              </div>
              <div className="flex justify-between gap-3 sm:justify-start">
                <dt className="text-muted">{d.model}:</dt>
                <dd className="font-medium text-foreground">{sell.model}</dd>
              </div>
              {sell.deviceCondition && (
                <div className="flex justify-between gap-3 sm:justify-start">
                  <dt className="text-muted">{d.condition}:</dt>
                  <dd className="font-medium text-foreground">
                    {t.sell.conditions[sell.deviceCondition] ?? sell.deviceCondition}
                  </dd>
                </div>
              )}
              {sell.purchaseDate && (
                <div className="flex justify-between gap-3 sm:justify-start">
                  <dt className="text-muted">{d.purchaseDate}:</dt>
                  <dd className="font-medium text-foreground">
                    {dateFmt.format(new Date(sell.purchaseDate))}
                  </dd>
                </div>
              )}
            </dl>
            {sell.description && (
              <>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{d.problem}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{sell.description}</p>
              </>
            )}
            {(sell.imageUrls?.length ?? 0) > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{d.images}</h3>
                <ul className="mt-2 grid grid-cols-4 gap-2">
                  {sell.imageUrls!.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {/* Presigned, short-lived URL — plain <img> on purpose. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-20 w-full rounded-xl border border-border object-cover" loading="lazy" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* AI estimate — advisory, never binding */}
          {sell.aiEstimatedAt ? (
            <section className={card}>
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-foreground">
                <SparklesIcon className="h-4 w-4 text-gold" />
                {d.aiEstimateTitle}
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-icon">
                  {d.aiEstimateBadge}
                </span>
              </h2>
              {sell.aiEstimateMinPrice != null && sell.aiEstimateMaxPrice != null && (
                <p className="text-xl font-bold tracking-tight text-foreground" dir="ltr">
                  {formatMoney(sell.aiEstimateMinPrice, sell.aiEstimateCurrency ?? "AED")}
                  {" – "}
                  {formatMoney(sell.aiEstimateMaxPrice, sell.aiEstimateCurrency ?? "AED")}
                </p>
              )}
              {sell.aiEstimateCondition && (
                <p className="mt-1 text-sm text-muted">
                  {d.inspectedCondition}: {t.sell.conditions[sell.aiEstimateCondition] ?? sell.aiEstimateCondition}
                </p>
              )}
              {sell.aiEstimateSummary && (
                <p className="mt-2 text-sm text-muted">{sell.aiEstimateSummary}</p>
              )}
              <p className="mt-3 text-xs text-muted">{d.aiEstimateDisclaimer}</p>
            </section>
          ) : awaitingEstimate && !pollsDone ? (
            <section className={`${card} border-dashed`} aria-busy>
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <SparklesIcon className="h-4 w-4 animate-pulse text-gold motion-reduce:animate-none" />
                {d.estimatePending}
              </h2>
              <p className="mt-1 text-sm text-muted">{d.estimatePendingBody}</p>
            </section>
          ) : awaitingEstimate ? (
            <section className={card}>
              <h2 className="font-semibold text-foreground">{d.estimateUnavailable}</h2>
              <p className="mt-1 text-sm text-muted">{d.estimateUnavailableBody}</p>
            </section>
          ) : null}

          {/* Procurement's binding offer — what Buyology pays for the device */}
          {(sell.status === "OFFER_MADE" || sell.offerPrice != null) && (
            <section className={card}>
              <h2 className="mb-2 font-semibold text-foreground">{d.offerTitle}</h2>
              {sell.offerPrice != null && (
                <>
                  <p className="text-sm text-muted">{d.weWillPay}</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground" dir="ltr">
                    {formatMoney(sell.offerPrice, sell.offerPriceCurrency ?? "AED")}
                  </p>
                </>
              )}
              {sell.offerValidFor && (
                <p className="mt-1 text-sm text-muted">
                  {d.offerValidity}: {sell.offerValidFor}
                </p>
              )}
              {sell.inspectedCondition && (
                <p className="mt-1 text-sm text-muted">
                  {d.inspectedCondition}:{" "}
                  {t.sell.conditions[sell.inspectedCondition] ?? sell.inspectedCondition}
                </p>
              )}
              {sell.adminNote && (
                <p className="mt-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
                  {sell.adminNote}
                </p>
              )}
              {sell.status === "OFFER_MADE" && (
                <>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{d.payoutTitle}</h3>
                  <div className="mt-2 space-y-2">
                    <div className="rounded-xl border border-brand bg-brand-soft/40 p-3 text-sm">
                      <p className="font-semibold text-foreground">{d.payoutStore}</p>
                      <p className="mt-0.5 text-muted">{d.payoutStoreBody}</p>
                    </div>
                    <div className="rounded-xl border border-border p-3 text-sm opacity-60">
                      <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                        {d.payoutWallet}
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">
                          {d.comingSoon}
                        </span>
                      </p>
                      <p className="mt-0.5 text-muted">{d.payoutWalletBody}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy != null}
                      onClick={() => void run("accept", () => respondToSellOffer(sellId, true))}
                      className={primaryBtn}
                    >
                      {busy === "accept" ? d.saving : d.acceptOffer}
                    </button>
                    <button
                      type="button"
                      disabled={busy != null}
                      onClick={() => void run("decline", () => respondToSellOffer(sellId, false))}
                      className={secondaryBtn}
                    >
                      {busy === "decline" ? d.saving : d.declineOffer}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        {/* Right rail: delivery / return actions */}
        <div className="space-y-6">
          {/* Inbound delivery */}
          {canChangeInbound && (
            <section className={card}>
              <h2 className="mb-3 font-semibold text-foreground">{d.deliveryTitle}</h2>
              {sell.inboundDeliveryMethod && !editingDelivery ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">
                    {sell.inboundDeliveryMethod === "COURIER_PICKUP" ? d.courierPickup : d.bringToStore}
                  </p>
                  {sell.inboundDeliveryMethod === "STORE_DROPOFF" && sell.storeBranchName && (
                    <p className="text-muted">
                      {sell.storeBranchName}
                      {sell.storeAddress ? ` — ${sell.storeAddress}` : ""}
                    </p>
                  )}
                  {sell.inboundDeliveryMethod === "COURIER_PICKUP" && (
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        sell.courierFeePaid
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-gold/15 text-warn dark:text-gold"
                      }`}
                    >
                      {sell.courierFeePaid ? d.feePaid : d.feeUnpaid}
                    </span>
                  )}
                  {inboundCourierPending && (
                    <div className="rounded-xl bg-gold/10 px-3 py-2.5 text-warn dark:text-gold">
                      <p className="text-sm font-semibold">{d.courierPaymentPending}</p>
                      <p className="mt-0.5 text-xs">{d.courierPaymentPendingBody}</p>
                      <button
                        type="button"
                        disabled={busy != null}
                        onClick={() =>
                          void run("repay", () =>
                            chooseSellDelivery(sellId, {
                              method: "COURIER_PICKUP",
                              redirectionUrl: redirectionUrl(),
                            }),
                          )
                        }
                        className={`${primaryBtn} mt-2`}
                      >
                        {busy === "repay" ? d.redirecting : `${d.payCourierFee}${feeLabel ? ` (${feeLabel})` : ""}`}
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingDelivery(true)}
                    className="text-sm font-medium text-brand-icon hover:underline"
                  >
                    {d.changeDelivery}
                  </button>
                  <p className="text-xs text-muted">{d.deliveryChangeHint}</p>
                  {sell.courierFeeRefundDue && (
                    <p className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-muted">
                      {d.switchRefundNote}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {deliveryPicker("inbound")}
                  {sell.inboundDeliveryMethod && (
                    <button
                      type="button"
                      onClick={() => setEditingDelivery(false)}
                      className="mt-3 text-sm font-medium text-muted hover:text-foreground"
                    >
                      {d.cancelChange}
                    </button>
                  )}
                </>
              )}
            </section>
          )}

          {/* Return after declining */}
          {sell.status === "DECLINED" && (
            <section className={card}>
              <h2 className="mb-2 font-semibold text-foreground">{d.returnTitle}</h2>
              <p className="mb-3 text-sm text-muted">{d.returnBody}</p>
              {sell.returnDeliveryMethod ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">
                    {sell.returnDeliveryMethod === "COURIER_RETURN" ? d.returnCourierChosen : d.returnPickupChosen}
                  </p>
                  {returnCourierPending && (
                    <div className="rounded-xl bg-gold/10 px-3 py-2.5 text-warn dark:text-gold">
                      <p className="text-xs">{d.returnPaymentPendingBody}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy != null}
                          onClick={() =>
                            void run("return-repay", () =>
                              chooseSellReturn(sellId, {
                                method: "COURIER_RETURN",
                                redirectionUrl: redirectionUrl(),
                              }),
                            )
                          }
                          className={primaryBtn}
                        >
                          {busy === "return-repay" ? d.redirecting : `${d.payCourierFee}${feeLabel ? ` (${feeLabel})` : ""}`}
                        </button>
                        <button
                          type="button"
                          disabled={busy != null}
                          onClick={() => void run("switch-pickup", () => chooseSellReturn(sellId, { method: "STORE_PICKUP" }))}
                          className={secondaryBtn}
                        >
                          {d.switchToStorePickup}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                deliveryPicker("return")
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
