"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CloseIcon, SendIcon } from "@/components/icons";
import { useI18n } from "@/components/i18n/language-provider";
import { useAssistant } from "@/lib/assistant/useAssistant";
import { MAX_MESSAGE_LENGTH } from "@/lib/assistant/client";
import type { AssistantProductCard } from "@/types/assistant";

/** Market the assistant scopes products and prices to. */
const COUNTRY_CODE = "AE";
const CURRENCY = "AED";

/** Show the remaining-characters hint only near the cap. */
const COUNTER_THRESHOLD = 100;

/**
 * Buyobot avatar — drawn rather than imported so it inherits the brand palette
 * and stays sharp at every size. Mikado Yellow shell, American Blue visor.
 */
function BuyobotAvatar({
  className = "",
  waving = false,
}: {
  className?: string;
  /** Animates the raised arm. Only the launcher waves; the header stays still. */
  waving?: boolean;
}) {
  return (
    <svg viewBox="0 0 48 48" role="presentation" aria-hidden="true" className={className}>
      <line x1="21" y1="8" x2="21" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="21" cy="7" r="2.8" fill="currentColor" />
      <rect x="7" y="14" width="28" height="24" rx="8" fill="currentColor" />
      <rect x="12" y="20" width="18" height="11" rx="5.5" fill="var(--color-brand)" />
      <circle cx="17.5" cy="25.5" r="2.4" fill="var(--color-gold)" />
      <circle cx="25.5" cy="25.5" r="2.4" fill="var(--color-gold)" />
      <rect x="3.4" y="22" width="3.2" height="8" rx="1.6" fill="currentColor" />
      {/* raised arm — pivots at the elbow (40.5, 31) */}
      <g className={waving ? "buyo-wave" : undefined}>
        <rect x="38.5" y="22" width="4" height="9.5" rx="2" fill="currentColor" />
        <circle cx="40.5" cy="19.5" r="3.8" fill="currentColor" />
      </g>
    </svg>
  );
}

/**
 * A product the assistant referred to. Every price/image field can be ABSENT —
 * the server omits nulls rather than sending them — so each is read optionally.
 */
function AssistantCard({
  card,
  viewLabel,
  outOfStockLabel,
  preOrderLabel,
  refurbishedLabel,
}: {
  card: AssistantProductCard;
  viewLabel: string;
  outOfStockLabel: string;
  preOrderLabel: string;
  refurbishedLabel: string;
}) {
  const badge =
    card.availabilityStatus === "OUT_OF_STOCK"
      ? outOfStockLabel
      : card.availabilityStatus === "PRE_ORDER"
        ? preOrderLabel
        : null;

  const body = (
    <>
      {card.imageUrl ? (
        /* Deliberately NOT next/image: the optimizer allow-list is scoped to our product
           buckets, assistant cards may reference other hosts, and at 48px there is nothing
           worth optimizing — an unlisted host would just make next/image throw. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.imageUrl}
          alt=""
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-lg border border-border bg-white object-contain p-0.5"
        />
      ) : (
        <span
          aria-hidden="true"
          className="h-12 w-12 shrink-0 rounded-lg border border-border bg-surface-2"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {card.title ?? viewLabel}
        </span>
        {card.brandName && (
          <span className="block truncate text-xs text-muted">{card.brandName}</span>
        )}
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs">
          {card.price != null && card.currency && (
            <span className="font-semibold text-foreground">
              {card.price} {card.currency}
            </span>
          )}
          {card.originalPrice != null && card.originalPrice > (card.price ?? 0) && (
            <s className="text-muted">{card.originalPrice}</s>
          )}
          {card.isRefurbished && <span className="text-muted">{refurbishedLabel}</span>}
          {badge && <span className="font-medium text-warn">{badge}</span>}
        </span>
      </span>
    </>
  );

  // Linked by slug, not id — the id is for analytics and dedupe.
  return (
    <li>
      {card.slug ? (
        <Link
          href={`/product/${card.slug}`}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2 transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {body}
        </Link>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface p-2">
          {body}
        </div>
      )}
    </li>
  );
}

/**
 * Always-on chat launcher and panel, backed by the Buyology assistant API.
 *
 * The panel is a NON-modal dialog on purpose: a support widget should not trap
 * focus or lock page scroll the way the cart drawer and command palette do —
 * people need to keep reading the page while they type. So it closes on Escape
 * and on its own close button, but not on outside click, which would throw away
 * a half-typed question.
 *
 * The whole widget — launcher included — stays hidden until /status confirms the
 * assistant is switched on. A chat box that refuses the first message is a worse
 * first impression than no chat box.
 */
export function ChatWidget() {
  const { t, locale } = useI18n();
  const c = t.chat;

  const copy = useMemo(
    () => ({
      intro: c.intro,
      errorGeneric: c.errorGeneric,
      rateLimited: c.rateLimited,
    }),
    [c.intro, c.errorGeneric, c.rateLimited],
  );

  const { enabled, turns, busy, send, greet } = useAssistant(
    { language: locale, countryCode: COUNTRY_CODE, currency: CURRENCY },
    copy,
  );

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const panelId = `chat${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const quickReplies = [c.quickTrack, c.quickReturns, c.quickProduct, c.quickHuman];

  useEffect(() => {
    if (!open) return;
    greet();
    inputRef.current?.focus();
  }, [open, greet]);

  // Keep the newest turn in view as the transcript grows.
  useEffect(() => {
    if (open) logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns, busy, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        launcherRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || busy) return;
    setDraft("");
    void send(body);
  }

  // Hidden while checking, and entirely absent when the assistant is off.
  if (enabled !== true) return null;

  const remaining = MAX_MESSAGE_LENGTH - draft.length;

  return (
    <div className="pointer-events-none fixed bottom-4 end-4 z-[120] flex flex-col items-end gap-3 sm:bottom-6 sm:end-6">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={c.title}
          className="buyo-rise pointer-events-auto flex h-[min(32rem,calc(100vh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-elevated shadow-[var(--shadow-overlay)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-brand px-4 py-3 text-white">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg">
              <BuyobotAvatar className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{c.title}</span>
              <span className="flex items-center gap-1.5 text-xs text-white/75">
                <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {c.status}
              </span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={c.close}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Transcript */}
          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            aria-label={c.title}
            className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain bg-surface-2 p-3"
          >
            {turns.map((turn) => {
              if (turn.role === "notice") {
                return (
                  <p
                    key={turn.id}
                    role="alert"
                    className="rounded-xl border border-border bg-surface px-3.5 py-2 text-center text-xs text-warn"
                  >
                    {turn.text}
                  </p>
                );
              }
              const mine = turn.role === "customer";
              return (
                <div key={turn.id} className={mine ? "flex justify-end" : "space-y-2"}>
                  <p
                    // Model-generated plain text: rendered as a string child,
                    // never as HTML. Line breaks come from CSS, not markup.
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                      mine
                        ? "bg-primary text-primary-fg"
                        : "inline-block border border-border bg-surface text-foreground"
                    }`}
                  >
                    {turn.text}
                  </p>

                  {!mine && turn.products.length > 0 && (
                    <ul className="space-y-1.5">
                      {turn.products.map((card) => (
                        <AssistantCard
                          key={card.id}
                          card={card}
                          viewLabel={c.viewProduct}
                          outOfStockLabel={c.outOfStock}
                          preOrderLabel={c.preOrder}
                          refurbishedLabel={c.refurbished}
                        />
                      ))}
                    </ul>
                  )}

                  {!mine && turn.escalate && (
                    <Link
                      href="/contact"
                      onClick={close}
                      className="inline-flex items-center rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {c.escalateCta}
                    </Link>
                  )}
                </div>
              );
            })}

            {busy && (
              <p className="w-fit rounded-2xl border border-border bg-surface px-3.5 py-2 text-sm text-muted">
                {c.typing}
              </p>
            )}
          </div>

          {/* Quick replies — real questions, sent through the assistant. */}
          {turns.length <= 1 && !busy && (
            <div className="flex flex-wrap gap-1.5 border-t border-border bg-surface px-3 pt-2.5">
              {quickReplies.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => void send(label)}
                  className="rounded-full border border-border-strong px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form onSubmit={submit} className="flex items-center gap-2 bg-surface p-3">
            <input
              ref={inputRef}
              value={draft}
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={c.placeholder}
              aria-label={c.placeholder}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label={c.send}
              disabled={busy || !draft.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <SendIcon className="h-4 w-4 rtl:-scale-x-100" />
            </button>
          </form>

          <p className="border-t border-border bg-surface px-3 py-2 text-[11px] leading-snug text-muted">
            {remaining <= COUNTER_THRESHOLD
              ? c.charsLeft.replace("{n}", String(remaining))
              : c.disclaimer}
          </p>
        </div>
      )}

      {/* Greeting bubble. aria-hidden because the launcher's own aria-label
          already names the action — announcing both would be redundant. */}
      {!open && (
        <div className="pointer-events-none flex w-full justify-end pe-[4.25rem]">
          <p
            aria-hidden="true"
            className="buyo-rise relative -mb-11 max-w-[13rem] rounded-2xl rounded-ee-sm border border-border bg-elevated px-3.5 py-2 text-sm font-medium text-foreground shadow-[var(--shadow-elevation)]"
          >
            {c.greeting}
          </p>
        </div>
      )}

      {/* Launcher */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? c.close : c.launch}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-fg shadow-[var(--shadow-overlay)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95"
      >
        {open ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <>
            <BuyobotAvatar className="h-8 w-8" waving />
            {/* Availability dot — the 24/7 signal, mirrored under RTL. */}
            <span
              aria-hidden="true"
              className="absolute -top-0.5 end-0 block h-3.5 w-3.5 rounded-full border-2 border-background bg-emerald-500"
            />
          </>
        )}
      </button>
    </div>
  );
}
