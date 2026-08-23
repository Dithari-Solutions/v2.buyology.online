"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";
import { formatMoney } from "@/lib/format";
import { currentMarket } from "@/lib/market";
import {
  chooseRepairDelivery,
  chooseRepairReturn,
  fetchRepair,
  fetchRepairStores,
  respondToRepairPrice,
  type RepairRequest,
  type RepairStore,
} from "@/lib/repair-api";
import { repairStatusTone } from "@/components/repair/MyRepairs";
import { PENDING_ORDER_KEY, PENDING_TX_KEY } from "@/components/checkout/CheckoutView";
import { ChevronLeftIcon, SparklesIcon, TruckIcon, WrenchIcon } from "@/components/icons";

const card = "rounded-2xl border border-border bg-surface p-5";
const primaryBtn =
  "rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const secondaryBtn =
  "rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * One repair, tracked and acted on. The status decides which action card shows: choose (or
 * change) how the device reaches us while it hasn't; pay a pending courier fee; answer the
 * team's binding quote; choose the way back after declining. The AI estimate is advisory
 * and arrives asynchronously — this page polls for it briefly after submission.
 */
export function RepairDetail({ repairId }: { repairId: string }) {
  const { t, locale } = useI18n();
  const r = t.repair;
  const d = r.detail;
  const router = useRouter();
  const { status: authStatus } = useAuth();

  const [repair, setRepair] = useState<RepairRequest | null>(null);
  const [missing, setMissing] = useState(false);
  const [stores, setStores] = useState<RepairStore[] | null>(null);
  const [storeId, setStoreId] = useState<string>("");
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "guest") router.replace(`/login?next=/repair/${repairId}`);
    if (authStatus !== "authed") return;
    let cancelled = false;
    fetchRepair(repairId)
      .then((res) => {
        if (!cancelled) setRepair(res);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, repairId, router]);

  // The AI estimate lands seconds after submission — poll briefly while it's absent.
  const pollsRef = useRef(0);
  const [pollsDone, setPollsDone] = useState(false);
  const [pollTick, setPollTick] = useState(0);
  const awaitingEstimate =
    repair != null &&
    !repair.aiEstimatedAt &&
    (repair.status === "SUBMITTED" || repair.status === "AWAITING_DEVICE");
  useEffect(() => {
    if (!awaitingEstimate || pollsDone) return;
    const timer = setTimeout(async () => {
      pollsRef.current += 1;
      if (pollsRef.current >= 20) setPollsDone(true);
      try {
        const fresh = await fetchRepair(repairId);
        setRepair(fresh);
      } catch {
        // A failed poll must still re-arm the next one — bump a tick so the effect re-fires.
        setPollTick((n) => n + 1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [awaitingEstimate, repair, repairId, pollsDone, pollTick]);

  const needStores =
    editingDelivery ||
    (repair != null &&
      (repair.status === "SUBMITTED" || repair.status === "DECLINED") &&
      !repair.inboundDeliveryMethod);
  useEffect(() => {
    if (!needStores || stores !== null) return;
    let cancelled = false;
    fetchRepairStores()
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
    async (key: string, action: () => Promise<RepairRequest | { repair: RepairRequest; payment: { transactionId: string; checkoutUrl?: string | null } | null }>) => {
      if (busy) return;
      setBusy(key);
      setError(null);
      try {
        const res = await action();
        if ("repair" in res) {
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
          setRepair(res.repair);
        } else {
          setRepair(res);
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
        <Link href="/repair/my" className="mt-4 inline-block font-semibold text-brand-icon hover:underline">
          {d.backToList}
        </Link>
      </div>
    );
  }
  if (!repair) {
    return (
      <div className="space-y-4" aria-busy>
        <div className="h-24 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
      </div>
    );
  }

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const feeLabel =
    repair.courierFeeAmount != null
      ? formatMoney(repair.courierFeeAmount, repair.courierFeeCurrency ?? "AED")
      : null;
  const canChangeInbound = repair.status === "SUBMITTED" || repair.status === "AWAITING_DEVICE";
  const inboundCourierPending =
    repair.status === "SUBMITTED" &&
    repair.inboundDeliveryMethod === "COURIER_PICKUP" &&
    !repair.courierFeePaid;
  const returnCourierPending =
    repair.status === "DECLINED" &&
    repair.returnDeliveryMethod === "COURIER_RETURN" &&
    !repair.courierFeePaid;
  const redirectionUrl = () =>
    `${window.location.origin}/payment/callback?kind=repair-courier-fee&repairId=${repairId}`;

  const infoStrip =
    repair.status === "SUBMITTED" && !repair.inboundDeliveryMethod
      ? d.reviewing
      : repair.status === "AWAITING_DEVICE"
        ? repair.inboundDeliveryMethod === "COURIER_PICKUP"
          ? d.awaitingCourier
          : d.awaitingDropoff.replace("{{store}}", repair.storeBranchName ?? d.theStore)
        : repair.status === "UNDER_REVIEW"
          ? d.underReview
          : repair.status === "IN_REPAIR"
            ? d.inRepair
            : repair.status === "COMPLETED"
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
              chooseRepairDelivery(repairId, { method: "STORE_DROPOFF", storeLocationId: storeId }),
            );
          } else {
            void run("pickup-store", () => chooseRepairReturn(repairId, { method: "STORE_PICKUP" }));
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
        hidden={!currentMarket().paymentsEnabled}
        disabled={
          busy != null ||
          (kind === "inbound" &&
            repair.inboundDeliveryMethod === "COURIER_PICKUP" &&
            repair.courierFeePaid === true)
        }
        onClick={() =>
          kind === "inbound"
            ? void run("courier", () =>
                chooseRepairDelivery(repairId, {
                  method: "COURIER_PICKUP",
                  redirectionUrl: redirectionUrl(),
                }),
              )
            : void run("courier-return", () =>
                chooseRepairReturn(repairId, {
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
      <Link href="/repair/my" className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground">
        <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
        {d.backToList}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground" dir="ltr">
          {repair.reference ?? repair.id.slice(0, 8)}
        </h1>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${repairStatusTone(repair.status)}`}>
          {r.statuses[repair.status] ?? repair.status}
        </span>
        {repair.createdAt && (
          <span className="ms-auto text-sm text-muted">
            {d.dateSubmitted}: {dateFmt.format(new Date(repair.createdAt))}
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
              {repair.productName}
            </h2>
            <dl className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3 sm:justify-start">
                <dt className="text-muted">{d.brand}:</dt>
                <dd className="font-medium text-foreground">{repair.brand}</dd>
              </div>
              <div className="flex justify-between gap-3 sm:justify-start">
                <dt className="text-muted">{d.model}:</dt>
                <dd className="font-medium text-foreground">{repair.model}</dd>
              </div>
              {repair.purchaseDate && (
                <div className="flex justify-between gap-3 sm:justify-start">
                  <dt className="text-muted">{d.purchaseDate}:</dt>
                  <dd className="font-medium text-foreground">
                    {dateFmt.format(new Date(repair.purchaseDate))}
                  </dd>
                </div>
              )}
            </dl>
            {repair.description && (
              <>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{d.problem}</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{repair.description}</p>
              </>
            )}
            {(repair.imageUrls?.length ?? 0) > 0 && (
              <>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{d.images}</h3>
                <ul className="mt-2 grid grid-cols-4 gap-2">
                  {repair.imageUrls!.map((url) => (
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
          {repair.aiEstimatedAt ? (
            <section className={card}>
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-foreground">
                <SparklesIcon className="h-4 w-4 text-gold" />
                {d.aiEstimateTitle}
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-icon">
                  {d.aiEstimateBadge}
                </span>
              </h2>
              {repair.aiEstimateMinPrice != null && repair.aiEstimateMaxPrice != null && (
                <p className="text-xl font-bold tracking-tight text-foreground" dir="ltr">
                  {formatMoney(repair.aiEstimateMinPrice, repair.aiEstimateCurrency ?? "AED")}
                  {" – "}
                  {formatMoney(repair.aiEstimateMaxPrice, repair.aiEstimateCurrency ?? "AED")}
                </p>
              )}
              {repair.aiEstimateTime && (
                <p className="mt-1 text-sm text-muted">
                  {d.aiEstimateTime}: {repair.aiEstimateTime}
                </p>
              )}
              {repair.aiEstimateSummary && (
                <p className="mt-2 text-sm text-muted">{repair.aiEstimateSummary}</p>
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

          {/* The team's binding quote */}
          {(repair.status === "PRICE_ESTIMATED" || repair.estimatedPrice != null) && (
            <section className={card}>
              <h2 className="mb-2 font-semibold text-foreground">{d.costEstimate}</h2>
              {repair.estimatedPrice != null && (
                <p className="text-2xl font-bold tracking-tight text-foreground" dir="ltr">
                  {formatMoney(repair.estimatedPrice, repair.estimatedPriceCurrency ?? "AED")}
                </p>
              )}
              {repair.estimatedTime && (
                <p className="mt-1 text-sm text-muted">
                  {d.estimatedTime}: {repair.estimatedTime}
                </p>
              )}
              {repair.adminNote && (
                <p className="mt-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-muted">
                  {repair.adminNote}
                </p>
              )}
              {repair.status === "PRICE_ESTIMATED" && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busy != null}
                    onClick={() => void run("accept", () => respondToRepairPrice(repairId, true))}
                    className={primaryBtn}
                  >
                    {busy === "accept" ? d.saving : d.acceptRepair}
                  </button>
                  <button
                    type="button"
                    disabled={busy != null}
                    onClick={() => void run("decline", () => respondToRepairPrice(repairId, false))}
                    className={secondaryBtn}
                  >
                    {busy === "decline" ? d.saving : d.declineRepair}
                  </button>
                </div>
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
              {repair.inboundDeliveryMethod && !editingDelivery ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">
                    {repair.inboundDeliveryMethod === "COURIER_PICKUP" ? d.courierPickup : d.bringToStore}
                  </p>
                  {repair.inboundDeliveryMethod === "STORE_DROPOFF" && repair.storeBranchName && (
                    <p className="text-muted">
                      {repair.storeBranchName}
                      {repair.storeAddress ? ` — ${repair.storeAddress}` : ""}
                    </p>
                  )}
                  {repair.inboundDeliveryMethod === "COURIER_PICKUP" && (
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        repair.courierFeePaid
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-gold/15 text-warn dark:text-gold"
                      }`}
                    >
                      {repair.courierFeePaid ? d.feePaid : d.feeUnpaid}
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
                            chooseRepairDelivery(repairId, {
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
                  {repair.courierFeeRefundDue && (
                    <p className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-muted">
                      {d.switchRefundNote}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {deliveryPicker("inbound")}
                  {repair.inboundDeliveryMethod && (
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
          {repair.status === "DECLINED" && (
            <section className={card}>
              <h2 className="mb-2 font-semibold text-foreground">{d.returnTitle}</h2>
              <p className="mb-3 text-sm text-muted">{d.returnBody}</p>
              {repair.returnDeliveryMethod ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">
                    {repair.returnDeliveryMethod === "COURIER_RETURN" ? d.returnCourierChosen : d.returnPickupChosen}
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
                              chooseRepairReturn(repairId, {
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
                          onClick={() => void run("switch-pickup", () => chooseRepairReturn(repairId, { method: "STORE_PICKUP" }))}
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
