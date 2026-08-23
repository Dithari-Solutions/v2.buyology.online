"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/language-provider";
import { formatMoney } from "@/lib/format";
import { lockBodyScroll } from "@/lib/scroll-lock";
import {
  ACTIVE_REFUND_STATUSES,
  createRefund,
  fetchMyRefunds,
  fetchRefundSettings,
  MAX_REFUND_IMAGE_BYTES,
  MAX_REFUND_IMAGES,
  MIN_REFUND_IMAGES,
  setReturnMethod,
  type RefundRequest,
  type RefundStatus,
} from "@/lib/refund-api";
import { PENDING_ORDER_KEY, PENDING_TX_KEY } from "@/components/checkout/CheckoutView";
import { AuthError } from "@/lib/auth/client";
import { CloseIcon, RentIcon } from "@/components/icons";

function statusTone(status: RefundStatus): string {
  if (status === "PAID") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (status === "REJECTED" || status === "FAILED") return "bg-red-500/10 text-red-700 dark:text-red-400";
  if (status === "PENDING_REVIEW" || status === "COURIER_FEE_PENDING")
    return "bg-gold/15 text-warn dark:text-gold";
  return "bg-brand-soft text-brand-icon";
}

/**
 * The refund surface on one order: request (delivered + inside the window + no active
 * request), then track the request through review, return-method choice — free store
 * drop-off or courier pickup behind a Paymob-paid fee — and payout. Whole-order refunds
 * only; the backend snapshots the amount.
 */
export function RefundCard({
  orderId,
  orderStatus,
  deliveredAt,
  currency,
  hasPaymentTransaction,
}: {
  orderId: string;
  orderStatus: string;
  deliveredAt?: string | null;
  currency?: string | null;
  hasPaymentTransaction: boolean;
}) {
  const { t, locale } = useI18n();
  const r = t.account.orders.refund;

  const [refund, setRefund] = useState<RefundRequest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [windowDays, setWindowDays] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [withinWindow, setWithinWindow] = useState(false);
  const [modal, setModal] = useState<"none" | "request" | "method">("none");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchMyRefunds(0, 50).catch(() => null),
      fetchRefundSettings().catch(() => null),
    ]).then(([rows, settings]) => {
      // A failed load must not fabricate eligibility (hiding an active request, or offering
      // a request the server will refuse) — the card simply doesn't render this visit.
      if (cancelled || rows == null || settings == null) return;
      const mine = rows
        .filter((x) => x.orderId === orderId)
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      setRefund(mine.find((x) => ACTIVE_REFUND_STATUSES.includes(x.status)) ?? mine[0] ?? null);
      setWindowDays(settings.returnWindowDays);
      setEnabled(settings.enabled);
      // Evaluated once at load — the window is measured in days, a page visit in minutes.
      setWithinWindow(
        deliveredAt != null &&
          (settings.returnWindowDays == null ||
            Date.now() <
              new Date(deliveredAt).getTime() + settings.returnWindowDays * 86_400_000),
      );
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [orderId, deliveredAt]);

  useEffect(() => {
    if (modal === "none") return;
    const release = lockBodyScroll();
    return release;
  }, [modal]);

  if (!loaded) return null;

  const active = refund != null && ACTIVE_REFUND_STATUSES.includes(refund.status);
  const canRequest =
    enabled && !active && orderStatus === "DELIVERED" && withinWindow && hasPaymentTransaction;

  if (!refund && !canRequest) return null;

  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 text-sm">
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <RentIcon className="h-4 w-4 text-gold" />
        {r.title}
      </h2>

      {refund ? (
        <div className="space-y-2.5">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusTone(refund.status)}`}
          >
            {r.statuses[refund.status] ?? refund.status}
          </span>
          {refund.refundAmount != null && (
            <p className="text-muted">
              {r.amount}:{" "}
              <span className="font-medium text-foreground" dir="ltr">
                {formatMoney(refund.refundAmount, refund.refundCurrency ?? currency ?? undefined)}
              </span>
            </p>
          )}
          {refund.returnMethod && (
            <p className="text-muted">
              {r.method}:{" "}
              <span className="font-medium text-foreground">
                {refund.returnMethod === "STORE_DROPOFF" ? r.dropoffTitle : r.courierTitle}
              </span>
            </p>
          )}
          {refund.adminNote && refund.status !== "REJECTED" && (
            <p className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-muted">
              {refund.adminNote}
            </p>
          )}
          {refund.rejectionReason && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-red-700 dark:text-red-400">
              {refund.rejectionReason}
            </p>
          )}
          {refund.status === "COURIER_FEE_PENDING" && (
            <p className="rounded-xl bg-gold/10 px-3 py-2 text-warn dark:text-gold">{r.feePending}</p>
          )}
          {refund.paidAt && (
            <p className="text-xs text-muted">{dateFmt.format(new Date(refund.paidAt))}</p>
          )}
          {canRequest && (
            <button
              type="button"
              onClick={() => setModal("request")}
              className="mt-1 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {r.request}
            </button>
          )}
          {(refund.status === "APPROVED" || refund.status === "COURIER_FEE_PENDING") && (
            <button
              type="button"
              onClick={() => setModal("method")}
              className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {refund.status === "APPROVED" ? r.chooseMethod : r.payCourierFee}
            </button>
          )}
        </div>
      ) : (
        <>
          {windowDays != null && <p className="mb-3 text-xs text-muted">{r.windowNote}</p>}
          <button
            type="button"
            onClick={() => setModal("request")}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {r.request}
          </button>
        </>
      )}

      {modal === "request" && (
        <RequestModal
          orderId={orderId}
          onClose={() => setModal("none")}
          onCreated={(created) => {
            setRefund(created);
            setModal("none");
          }}
        />
      )}
      {modal === "method" && refund && (
        <MethodModal
          refund={refund}
          orderId={orderId}
          currency={currency ?? refund.refundCurrency ?? "AED"}
          onClose={() => setModal("none")}
          onChosen={(updated) => {
            setRefund(updated);
            setModal("none");
          }}
        />
      )}
    </section>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []);

  function trapTab(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
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

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="buyo-overlay absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        onKeyDown={trapTab}
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-background p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function RequestModal({
  orderId,
  onClose,
  onCreated,
}: {
  orderId: string;
  onClose: () => void;
  onCreated: (r: RefundRequest) => void;
}) {
  const { t } = useI18n();
  const r = t.account.orders.refund;
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  function pick(list: FileList | null) {
    if (!list) return;
    setError(null);
    const merged = [...files];
    for (const f of Array.from(list)) {
      if (!f.type.startsWith("image/")) {
        setError(r.errNotImage);
        continue;
      }
      if (f.size > MAX_REFUND_IMAGE_BYTES) {
        setError(r.errFileSize);
        continue;
      }
      merged.push(f);
    }
    const next = merged.slice(0, MAX_REFUND_IMAGES);
    setFiles(next);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit() {
    if (busy) return;
    if (description.trim().length < 10) {
      setError(r.errDescription);
      return;
    }
    if (files.length < MIN_REFUND_IMAGES) {
      setError(r.errMinImages);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onCreated(await createRefund(orderId, description.trim(), files));
    } catch (err) {
      setError(err instanceof AuthError && err.status === 409 && err.message ? err.message : r.errGeneric);
      setBusy(false);
    }
  }

  return (
    <ModalShell title={r.modalTitle} onClose={busy ? () => {} : onClose}>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">{r.descLabel}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={r.descPlaceholder}
          rows={4}
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="mt-1 block text-xs text-muted">{r.descHelp}</span>
      </label>

      <div className="mt-4">
        <span className="mb-1.5 block text-sm font-medium text-foreground">{r.imagesLabel}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => pick(e.target.files)}
          className="block w-full text-sm text-muted file:me-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-foreground hover:file:bg-border"
        />
        <span className="mt-1 block text-xs text-muted">{r.imagesHelp}</span>
        {previews.length > 0 && (
          <ul className="mt-3 grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <li key={src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-24 w-full rounded-xl border border-border object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    const nf = files.filter((_, k) => k !== i);
                    URL.revokeObjectURL(previews[i]);
                    setFiles(nf);
                    setPreviews(previews.filter((_, k) => k !== i));
                  }}
                  aria-label={t.cart.remove}
                  className="absolute end-1 top-1 rounded-full bg-black/60 p-1 text-white"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="flex-1 rounded-full bg-primary py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? r.submitting : r.submit}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:opacity-60"
        >
          {t.account.orders.cancelKeep}
        </button>
      </div>
    </ModalShell>
  );
}

function MethodModal({
  refund,
  orderId,
  currency,
  onClose,
  onChosen,
}: {
  refund: RefundRequest;
  orderId: string;
  currency: string;
  onClose: () => void;
  onChosen: (r: RefundRequest) => void;
}) {
  const { t } = useI18n();
  const r = t.account.orders.refund;
  const [busy, setBusy] = useState<"STORE_DROPOFF" | "COURIER_PICKUP" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(method: "STORE_DROPOFF" | "COURIER_PICKUP") {
    if (busy) return;
    setBusy(method);
    setError(null);
    try {
      const res = await setReturnMethod(refund.id, {
        method,
        currency,
        redirectionUrl:
          method === "COURIER_PICKUP"
            ? `${window.location.origin}/payment/callback?kind=courier-fee&orderId=${orderId}`
            : undefined,
      });
      if (method === "COURIER_PICKUP" && res.payment?.checkoutUrl) {
        try {
          sessionStorage.setItem(PENDING_TX_KEY, res.payment.transactionId);
          sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
        } catch {
          /* callback falls back to params */
        }
        // Deliberately keep busy set — the page is leaving for Paymob.
        window.location.href = res.payment.checkoutUrl;
        return;
      }
      onChosen(res.refund);
    } catch (err) {
      setError(err instanceof AuthError && err.status === 409 && err.message ? err.message : r.errGeneric);
      setBusy(null);
    }
  }

  return (
    <ModalShell title={r.methodTitle} onClose={busy ? () => {} : onClose}>
      <p className="mb-4 text-sm text-muted">{r.methodHint}</p>
      <div className="space-y-3">
        <button
          type="button"
          disabled={busy != null}
          onClick={() => choose("STORE_DROPOFF")}
          className="w-full rounded-xl border border-border p-4 text-start transition-colors hover:border-border-strong disabled:opacity-60"
        >
          <span className="font-semibold text-foreground">{r.dropoffTitle}</span>
          <span className="mt-1 block text-sm text-muted">{r.dropoffDesc}</span>
        </button>
        <button
          type="button"
          disabled={busy != null}
          onClick={() => choose("COURIER_PICKUP")}
          className="w-full rounded-xl border border-border p-4 text-start transition-colors hover:border-border-strong disabled:opacity-60"
        >
          <span className="font-semibold text-foreground">{r.courierTitle}</span>
          <span className="mt-1 block text-sm text-muted">{r.courierDesc}</span>
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {busy && <p className="mt-3 text-sm text-muted">{r.methodSubmitting}</p>}
    </ModalShell>
  );
}
