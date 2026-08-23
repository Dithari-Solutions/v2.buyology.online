"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import {
  confirmPaymentRedirect,
  fetchTransaction,
  type PaymentTransaction,
} from "@/lib/checkout-api";
import { BUYNOW_ORDER_KEY, PENDING_ORDER_KEY, PENDING_TX_KEY } from "@/components/checkout/CheckoutView";
import { CheckIcon, CloseIcon, ClockIcon } from "@/components/icons";

type Outcome = "checking" | "success" | "failed" | "pending";

const TERMINAL = new Set(["SUCCESS", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"]);

/**
 * Where Paymob sends the browser back. Resolution order, mirroring what actually works:
 *  1. Forward the signed redirect params to confirm-redirect — public + HMAC-gated, so the
 *     verdict lands even though the full-page redirect wiped the in-memory access token.
 *  2. Fall back to polling the transaction once the session has silently restored.
 *  3. If nothing resolves in time: honest "still processing", pointing at the orders page —
 *     the server-to-server webhook records the truth regardless of what this tab sees.
 */
export function PaymentCallbackView() {
  const { t } = useI18n();
  const cb = t.checkout.callback;
  const params = useSearchParams();
  const { status: authStatus } = useAuth();
  const cart = useCart();

  const [outcome, setOutcome] = useState<Outcome>("checking");
  const [orderId, setOrderId] = useState<string | null>(null);
  const kind = params.get("kind");
  const courierFee = kind === "courier-fee";
  const repairFee = kind === "repair-courier-fee";
  const repairId = params.get("repairId");
  const sellFee = kind === "sell-courier-fee";
  const sellId = params.get("sellId");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    // Polling needs the restored session; confirm-redirect does not. Wait out the boot.
    if (authStatus === "loading") return;
    ranRef.current = true;

    const all: Record<string, string> = {};
    params.forEach((v, k) => {
      all[k] = v;
    });
    let storedTx: string | null = null;
    let storedOrder: string | null = null;
    try {
      storedTx = sessionStorage.getItem(PENDING_TX_KEY);
      storedOrder = sessionStorage.getItem(PENDING_ORDER_KEY);
    } catch {
      /* ignore */
    }

    const finish = (tx: PaymentTransaction | null, paymobSuccess: string | null) => {
      // Courier-fee transactions carry no appOrderId; the redirect embeds the order id.
      const oid = tx?.appOrderId ?? storedOrder ?? all.orderId ?? null;
      setOrderId(oid ?? null);
      if (tx && TERMINAL.has(tx.status)) {
        setOutcome(tx.status === "FAILED" || tx.status === "CANCELLED" ? "failed" : "success");
      } else if (paymobSuccess === "false") {
        setOutcome("failed");
      } else {
        // Includes success=true with no backend confirmation: an unverified URL flag must
        // not paint "paid" — the honest pending screen points at the orders page, where the
        // server-to-server webhook's verdict shows.
        setOutcome("pending");
      }
      // Only a backend-confirmed settlement clears the retry breadcrumbs.
      if (tx?.status === "SUCCESS") {
        try {
          sessionStorage.removeItem(PENDING_TX_KEY);
          sessionStorage.removeItem(PENDING_ORDER_KEY);
          sessionStorage.removeItem(BUYNOW_ORDER_KEY);
        } catch {
          /* ignore */
        }
        cart.refresh(); // the backend cleared the ordered lines
      }
    };

    (async () => {
      // 1. Signed verdict straight to the backend.
      if (all.hmac) {
        try {
          const tx = await confirmPaymentRedirect(all);
          if (tx && TERMINAL.has(tx.status)) {
            finish(tx, null);
            return;
          }
        } catch {
          /* offline right after the redirect — fall through to polling */
        }
      }
      // 2. Poll the transaction (URL param, else the id stashed before the redirect).
      const txId = all.transactionId ?? storedTx;
      if (txId && authStatus === "authed") {
        for (let i = 0; i < 20; i++) {
          try {
            const tx = await fetchTransaction(txId);
            if (TERMINAL.has(tx.status)) {
              finish(tx, null);
              return;
            }
          } catch {
            /* transient — keep polling */
          }
          await new Promise((r) => setTimeout(r, 2500));
        }
      }
      // 3. Best-effort display from Paymob's own (HMAC-covered) success flag.
      finish(null, all.success ?? null);
    })();
  }, [authStatus, params, cart]);

  const shell = (icon: React.ReactNode, title: string, hint: string, actions: React.ReactNode) => (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      {icon}
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="text-muted">{hint}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">{actions}</div>
    </div>
  );

  const primaryBtn =
    "rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const secondaryBtn =
    "rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (outcome === "checking") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center" aria-busy>
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-brand motion-reduce:animate-none" aria-hidden="true" />
        <p className="text-muted">{cb.checking}</p>
      </div>
    );
  }
  if (outcome === "success") {
    return shell(
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckIcon className="h-8 w-8" />
      </span>,
      courierFee || repairFee || sellFee ? cb.feePaidTitle : cb.successTitle,
      sellFee ? cb.sellFeeHint : repairFee ? cb.repairFeeHint : courierFee ? cb.feePaidHint : cb.successHint,
      <>
        {sellFee && sellId ? (
          <Link href={`/sell/${sellId}`} className={primaryBtn}>
            {cb.toSell}
          </Link>
        ) : repairFee && repairId ? (
          <Link href={`/repair/${repairId}`} className={primaryBtn}>
            {cb.toRepair}
          </Link>
        ) : orderId ? (
          <Link href={`/account/orders/${orderId}`} className={primaryBtn}>
            {cb.viewOrder}
          </Link>
        ) : null}
        <Link href="/" className={secondaryBtn}>
          {t.cart.continueShopping}
        </Link>
      </>,
    );
  }
  if (outcome === "failed") {
    return shell(
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
        <CloseIcon className="h-8 w-8" />
      </span>,
      cb.failedTitle,
      cb.failedHint,
      <>
        <Link
          href={
            sellFee && sellId
              ? `/sell/${sellId}`
              : repairFee && repairId
                ? `/repair/${repairId}`
                : "/checkout"
          }
          className={primaryBtn}
        >
          {cb.tryAgain}
        </Link>
        <Link href="/account" className={secondaryBtn}>
          {cb.toOrders}
        </Link>
      </>,
    );
  }
  return shell(
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-warn dark:text-gold">
      <ClockIcon className="h-8 w-8" />
    </span>,
    cb.pendingTitle,
    cb.pendingHint,
    <Link
      href={
        sellFee && sellId
          ? `/sell/${sellId}`
          : repairFee && repairId
            ? `/repair/${repairId}`
            : "/account"
      }
      className={primaryBtn}
    >
      {sellFee && sellId ? cb.toSell : repairFee && repairId ? cb.toRepair : cb.toOrders}
    </Link>,
  );
}
