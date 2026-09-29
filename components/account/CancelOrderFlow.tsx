"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import type { Dict } from "@/lib/i18n/dictionaries";
import { AuthError } from "@/lib/auth/client";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { cancelOrder } from "@/lib/account-api";
import {
  CANCEL_FOLLOW_UPS,
  CANCEL_REASONS,
  MAX_CANCEL_TEXT_LENGTH,
  cancelPriceCurrency,
  composeCancellationFeedback,
  composeCancellationReason,
  readCancelPrice,
  type CancelAnswer,
  type CancelFollowUp,
  type CancelReasonCode,
} from "@/lib/cancel-reason";
import { CloseIcon } from "@/components/icons";

const radioCls =
  "h-[18px] w-[18px] shrink-0 accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const primaryBtn =
  "rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";
const dangerBtn =
  "rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";
const outlineBtn =
  "rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";
const ghostBtn =
  "rounded-full px-4 py-3 text-sm font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60";

/** 1 intro · 2 reason · 3 the reason's single follow-up · 4 thanks + confirm · 5 cancelled. */
type Step = "intro" | "reason" | "followUp" | "thanks" | "done";

/** One radio row, styled like the checkout's address and store pickers. */
function OptionRow({
  name,
  label,
  emoji,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  emoji?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
        checked ? "border-brand bg-brand-soft/40" : "border-border hover:border-border-strong"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className={radioCls} />
      {emoji && (
        <span className="text-base leading-none" aria-hidden="true">
          {emoji}
        </span>
      )}
      <span className="min-w-0 font-medium text-foreground">{label}</span>
    </label>
  );
}

/**
 * A free-text answer, with the remaining room shown. The box itself stops at the length that is
 * stored (lib/cancel-reason.ts), like every other bounded field here, so nothing the customer types
 * is ever cut with an ellipsis after the fact.
 */
function TextAnswer({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const { t } = useI18n();
  const c = t.account.orders.cancelFlow;
  // maxLength counts UTF-16 units while the stored clamp counts code points, so the element is the
  // stricter of the two and can never be overrun; the counter counts what the element counts, or it
  // would promise room the box refuses.
  const left = MAX_CANCEL_TEXT_LENGTH - value.length;
  return (
    <label className="mt-3 block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <textarea
        value={value}
        maxLength={MAX_CANCEL_TEXT_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <span className="mt-1 block text-xs text-muted">
        {c.charactersLeft.replace("{{count}}", String(left))}
      </span>
    </label>
  );
}

/**
 * The whole cancellation conversation, in one dialog, used by every entry point that offers to
 * cancel an order (the order page and the order list) so the two cannot drift.
 *
 * Five steps: are you sure, why, one follow-up question about that why, thanks + confirm, done.
 * Nothing is sent until "Confirm Cancellation" — "Keep My Order" at the first and fourth step, the
 * close button, Escape and the overlay all abort with no request and no state left behind, because
 * a customer who decides to keep the order must not have their reason filed against it.
 *
 * The answers leave here twice over, both built by lib/cancel-reason.ts from one object so they can
 * never disagree: as one English sentence stored on the order — the customer reads it back in their
 * own timeline and admins read it in the dashboard, so it is prose — and as the same answers
 * structured, question by question, for the dashboard's own list and for counting. Both are English
 * whatever locale this UI is in.
 */
export function CancelOrderFlow({
  orderId,
  orderNumber,
  currency,
  onClose,
  onCancelled,
}: {
  orderId: string;
  /** The order number as this app writes it elsewhere, e.g. "BUY-1A2B3C4D". */
  orderNumber: string;
  /**
   * The ORDER's currency, as the order page renders its totals in. Seven markets charge in seven
   * currencies, so the price follow-up asks in the one the customer is looking at.
   */
  currency?: string | null;
  /** Dismiss the flow having sent nothing. */
  onClose: () => void;
  /** Cancelled server-side — reload the order (or the list) so it reads CANCELLED. */
  onCancelled: () => void | Promise<void>;
}) {
  const { t } = useI18n();
  const o = t.account.orders;
  const c = o.cancelFlow;

  const [step, setStep] = useState<Step>("intro");
  const [reasonCode, setReasonCode] = useState<CancelReasonCode | null>(null);
  const [option, setOption] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape and the scroll lock are set up once for the life of the dialog; the handler reads the
  // live callback through a ref so it never closes over a stale onClose.
  const dismissRef = useRef(onClose);
  useEffect(() => {
    dismissRef.current = busy ? () => {} : onClose;
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const unlock = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      unlock();
      document.removeEventListener("keydown", onKey);
      restoreFocus(previous);
    };
  }, []);

  // Each step replaces the dialog's whole content, so focus goes to its heading — otherwise a
  // screen reader stays silent and the keyboard user is left wherever the old button was.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

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

  const priceCurrency = cancelPriceCurrency(currency);
  const reason = CANCEL_REASONS.find((r) => r.code === reasonCode) ?? null;
  const followUp: CancelFollowUp | null = reason?.followUp
    ? CANCEL_FOLLOW_UPS[reason.followUp]
    : null;

  /** A different reason means a different question — its old answer must not follow it. */
  function chooseReason(code: CancelReasonCode) {
    setReasonCode(code);
    setOption(null);
    setText("");
    setPrice("");
    setFieldError(null);
  }

  function clearFollowUp() {
    setOption(null);
    setText("");
    setPrice("");
    setFieldError(null);
  }

  function leaveReasonStep() {
    if (!reasonCode) {
      setFieldError(c.reasonRequired);
      return;
    }
    setFieldError(null);
    setStep(followUp ? "followUp" : "thanks");
  }

  function leaveFollowUpStep() {
    // A price we cannot read is ABSENT, never a guess (see readCancelPrice) — so say so here rather
    // than dropping it silently, and let them correct it, clear it or skip the question. One reading
    // decides both this and what is sent, so the field cannot accept a value the send then refuses.
    const priceState = followUp?.kind === "priceAndChoice" ? readCancelPrice(price).state : "absent";
    if (priceState === "unreadable" || priceState === "tooLarge") {
      setFieldError(priceState === "tooLarge" ? c.priceTooLarge : c.priceInvalid);
      return;
    }
    setFieldError(null);
    setStep("thanks");
  }

  async function confirm() {
    if (!reasonCode || busy) return;
    setBusy(true);
    setError(null);
    try {
      // One answer object for both components, so the prose and the structured answers can never
      // describe different selections.
      const answer: CancelAnswer = { reason: reasonCode, option, text, price, currency };
      await cancelOrder(
        orderId,
        composeCancellationReason(answer),
        composeCancellationFeedback(answer, "WEB"),
      );
      // The cancellation is already committed; a refresh that fails must not be reported as a
      // failed cancellation, so its error stays where it is raised.
      try {
        await onCancelled();
      } catch {
        /* the order page and the list each surface their own load failures */
      }
      setStep("done");
    } catch (err) {
      // Keep the dialog open on the confirm step: a refusal is never step 5.
      setError(isRefusal(err) ? err.message : c.errorFallback);
    } finally {
      setBusy(false);
    }
  }

  const title =
    step === "intro"
      ? c.introTitle
      : step === "reason"
        ? c.reasonTitle
        : step === "followUp"
          ? followUpQuestion(followUp, c)
          : step === "thanks"
            ? error
              ? c.errorTitle
              : c.thanksTitle
            : c.doneTitle;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div
        className="buyo-overlay absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
      />
      {/* dvh, not vh: iOS Safari resolves vh against the LARGE viewport, so with the URL bar showing
          the bottom of this panel — and the action row scrolls with its content — sits under the
          browser chrome on a short phone, worse again where a label wraps to two lines. */}
      <div
        ref={panelRef}
        onKeyDown={trapTab}
        className="relative flex max-h-[90dvh] w-full flex-col overflow-y-auto overscroll-contain rounded-t-2xl bg-background p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3
            ref={headingRef}
            id={headingId}
            tabIndex={-1}
            className="text-lg font-semibold text-foreground focus-visible:outline-none"
          >
            {title}
          </h3>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            aria-label={step === "done" ? c.close : c.keepOrder}
            className="-me-1 -mt-1 rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {step === "intro" && (
          <>
            <p className="text-sm text-muted">{c.introBody}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => setStep("reason")} className={primaryBtn}>
                {c.continueToCancellation}
              </button>
              <button type="button" onClick={onClose} className={ghostBtn}>
                {c.keepOrder}
              </button>
            </div>
          </>
        )}

        {step === "reason" && (
          <>
            <p className="text-sm text-muted">{c.reasonHint}</p>
            <div className="mt-3 space-y-2" role="radiogroup" aria-labelledby={headingId}>
              {CANCEL_REASONS.map((r) => (
                <OptionRow
                  key={r.code}
                  name="cancel-reason"
                  label={c.reasons[r.code] ?? r.code}
                  emoji={r.emoji}
                  checked={reasonCode === r.code}
                  onChange={() => chooseReason(r.code)}
                />
              ))}
            </div>
            {fieldError && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {fieldError}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={leaveReasonStep} className={primaryBtn}>
                {c.continue}
              </button>
              <button type="button" onClick={() => setStep("intro")} className={outlineBtn}>
                {c.back}
              </button>
            </div>
          </>
        )}

        {step === "followUp" && followUp && (
          <>
            <p className="text-sm text-muted">{c.optionalHint}</p>

            {followUp.kind === "priceAndChoice" && (
              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  {c.priceLabel.replace("{{currency}}", priceCurrency)}
                </span>
                <span className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 focus-within:ring-2 focus-within:ring-ring">
                  <span className="shrink-0 text-sm text-muted">{priceCurrency}</span>
                  <input
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setFieldError(null);
                    }}
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={c.pricePlaceholder}
                    dir="ltr"
                    className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
                  />
                </span>
              </label>
            )}

            {followUp.options.length > 0 && (
              <>
                {followUp.kind === "priceAndChoice" && (
                  <p className="mt-4 text-sm font-medium text-foreground">{c.placeQuestion}</p>
                )}
                <div
                  className="mt-2 space-y-2"
                  role="radiogroup"
                  aria-label={followUp.kind === "priceAndChoice" ? c.placeQuestion : title}
                >
                  {followUp.options.map((opt) => (
                    <OptionRow
                      key={opt.code}
                      name={`cancel-followup-${followUp.id}`}
                      label={optionLabel(followUp, opt.code, c)}
                      checked={option === opt.code}
                      onChange={() => {
                        setOption(opt.code);
                        // The text box belongs to "Other" alone; leaving it would attach words
                        // the customer wrote under a choice they abandoned.
                        setText("");
                        setFieldError(null);
                      }}
                    />
                  ))}
                </div>
                {followUp.options.find((opt) => opt.code === option)?.revealsText && (
                  <TextAnswer
                    label={otherLabel(followUp, c)}
                    placeholder={otherPlaceholder(followUp, c)}
                    value={text}
                    onChange={setText}
                  />
                )}
              </>
            )}

            {followUp.kind === "text" && (
              <TextAnswer
                label={
                  followUp.id === "differentProduct" ? c.differentProductLabel : c.otherReasonLabel
                }
                placeholder={
                  followUp.id === "differentProduct"
                    ? c.differentProductPlaceholder
                    : c.otherReasonPlaceholder
                }
                value={text}
                onChange={setText}
              />
            )}

            {fieldError && (
              <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
                {fieldError}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={leaveFollowUpStep} className={primaryBtn}>
                {c.continue}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearFollowUp();
                  setStep("thanks");
                }}
                className={outlineBtn}
              >
                {c.skip}
              </button>
              <button type="button" onClick={() => setStep("reason")} className={ghostBtn}>
                {c.back}
              </button>
            </div>
          </>
        )}

        {step === "thanks" && (
          <>
            {error ? (
              <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            ) : (
              <p className="text-sm text-muted">{c.thanksBody}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" disabled={busy} onClick={confirm} className={dangerBtn}>
                {busy ? c.pending : error ? c.retry : c.confirmCancellation}
              </button>
              <button type="button" disabled={busy} onClick={onClose} className={ghostBtn}>
                {error ? c.backToOrder : c.keepOrder}
              </button>
            </div>
            {/* Three reasons ask nothing further and arrive here straight from the list, so their
                Back goes back to the list — without it, a mis-tapped reason could only be corrected
                by abandoning the whole flow. */}
            {!error && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setStep(followUp ? "followUp" : "reason")}
                className="mt-3 self-start text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-60"
              >
                {c.back}
              </button>
            )}
          </>
        )}

        {step === "done" && (
          <>
            <p className="text-sm text-foreground">
              {c.doneBody.split("{{orderNumber}}")[0]}
              <span className="font-semibold" dir="ltr">
                {orderNumber}
              </span>
              {c.doneBody.split("{{orderNumber}}")[1]}
            </p>
            <p className="mt-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
              {c.refundNote}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/products" onClick={onClose} className={primaryBtn}>
                {c.continueShopping}
              </Link>
              <button type="button" onClick={onClose} className={ghostBtn}>
                {c.close}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Hands focus back on the way out. The trigger that opened the dialog is usually still there — but
 * not after a successful cancellation: both entry points render "Cancel Order" only while
 * isCancellable(status) holds and both refetch on success, so that button is gone by the time this
 * runs. focus() on a detached node is a silent no-op that leaves a keyboard or screen-reader user at
 * the very top of the document, so fall back to the page itself, which is where they now are; the
 * outcome is announced by the page's own live region.
 */
function restoreFocus(previous: HTMLElement | null) {
  if (previous?.isConnected) {
    previous.focus();
    return;
  }
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return;
  main.tabIndex = -1; // programmatically focusable only — never a tab stop
  main.focus();
}

/**
 * A refusal the customer can act on, and only that: a 4xx that came back with a message of its own —
 * the courier already collected the parcel, it is already on its way. A 500, an unreachable backend
 * or an empty body carries no guidance, only `HTTP 500` or whatever string the server happened to
 * produce, and showing that as if it were advice is worse than the fallback copy.
 */
function isRefusal(err: unknown): err is AuthError {
  return (
    err instanceof AuthError &&
    err.status >= 400 &&
    err.status < 500 &&
    !!err.message &&
    !/^HTTP \d+$/.test(err.message)
  );
}

type Copy = Dict["account"]["orders"]["cancelFlow"];

/** The follow-up's own question — the dialog heading on step 3. */
function followUpQuestion(followUp: CancelFollowUp | null, c: Copy): string {
  switch (followUp?.id) {
    case "cheaperElsewhere":
      return c.priceQuestion;
    case "deliveryTime":
      return c.deliveryTimeQuestion;
    case "whatChanged":
      return c.whatChangedQuestion;
    case "differentProduct":
      return c.differentProductQuestion;
    case "otherReason":
      return c.otherReasonQuestion;
    default:
      return c.reasonTitle;
  }
}

function optionLabel(followUp: CancelFollowUp, code: string, c: Copy): string {
  const labels =
    followUp.id === "cheaperElsewhere"
      ? c.places
      : followUp.id === "deliveryTime"
        ? c.deliveryTimes
        : c.whatChangedOptions;
  return labels[code] ?? code;
}

function otherLabel(followUp: CancelFollowUp, c: Copy): string {
  if (followUp.id === "cheaperElsewhere") return c.placeOtherLabel;
  if (followUp.id === "deliveryTime") return c.deliveryTimeOtherLabel;
  return c.whatChangedOtherLabel;
}

function otherPlaceholder(followUp: CancelFollowUp, c: Copy): string {
  if (followUp.id === "cheaperElsewhere") return c.placeOtherPlaceholder;
  if (followUp.id === "deliveryTime") return c.deliveryTimeOtherPlaceholder;
  return c.whatChangedOtherPlaceholder;
}
