"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthError } from "@/lib/auth/client";
import {
  enterGiveaway,
  fetchGiveawayStatus,
  instagramUrl,
  type GiveawayStatus,
} from "@/lib/giveaway-api";
import { ArrowRightShortIcon, CheckIcon, InstagramIcon } from "@/components/icons";

const cta =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";
/** Where a half-typed handle waits while the customer completes their account. */
const DRAFT_KEY = "buyo_giveaway_handle";

/**
 * A floor as tall as the tallest state this component can render.
 *
 * It has four — signing in, the entry form, an ineligible account, and already entered — and it
 * picks between them only after auth and a fetch resolve. Without a reserved height each of those
 * swaps shoves the rest of the home page down, which is a layout shift charged against every
 * visitor on the page that matters most.
 */
const RESERVED = "min-h-[13.5rem] sm:min-h-[8.5rem]";

const ghost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

/**
 * The giveaway's call to action, which is really four states: a guest is sent to sign in
 * (entry is per account, so there is nothing to enter as a visitor), an eligible customer
 * gets the handle form, an ineligible one is told exactly which gate to clear — today a
 * verified phone, the thing that actually stops one person making ten accounts — and an
 * entered customer sees their handle back, never a second form.
 */
export function GiveawayEntry() {
  const { t } = useI18n();
  const g = t.giveaway;
  const { status: authStatus } = useAuth();

  const [state, setState] = useState<GiveawayStatus | null>(null);
  // Survives the trip to the account and back, so a half-finished entry is never retyped.
  const [handle, setHandle] = useState(() => {
    try {
      return sessionStorage.getItem(DRAFT_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authed") return;
    let cancelled = false;
    fetchGiveawayStatus()
      .then((s) => {
        if (!cancelled) setState(s);
      })
      .catch(() => {
        // Unknown state: fall back to the sign-in-shaped CTA rather than a broken form.
        if (!cancelled) setState(null);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = handle.trim();
    if (busy || !value) return;
    setBusy(true);
    setError(null);
    try {
      setState(await enterGiveaway(value));
      setHandle("");
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* nothing to clear */
      }
    } catch (err) {
      // 400/409 carry a business reason worth reading (bad handle, already entered,
      // handle taken, phone unverified); anything else gets the generic line.
      setError(
        err instanceof AuthError && err.message && (err.status === 400 || err.status === 409)
          ? err.message
          : g.enterError,
      );
    } finally {
      setBusy(false);
    }
  }

  // Guests (and any account whose state we could not read) get the sign-in path.
  if (authStatus !== "authed" || state === null) {
    return (
      <div className={`${RESERVED} flex flex-col gap-3 sm:flex-row sm:items-start`}>
        <Link href="/login?next=/" className={cta}>
          {g.cta}
          <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
        </Link>
        <p className="text-xs text-white/60">{g.signInFirst}</p>
      </div>
    );
  }

  if (state.entered) {
    return (
      <div className={`${RESERVED} rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <CheckIcon className="h-5 w-5 shrink-0 text-gold" />
          {g.enteredTitle}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/75">
          {g.enteredAs}
          <a
            href={instagramUrl(state.instagramHandle ?? "")}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className="inline-flex items-center gap-1.5 break-all font-semibold text-gold hover:underline"
          >
            <InstagramIcon className="h-4 w-4 shrink-0" />@{state.instagramHandle}
          </a>
        </p>
      </div>
    );
  }

  if (!state.eligible) {
    const missing = state.missing ?? [];
    return (
      <div className={`${RESERVED} rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm`}>
        <p className="text-sm text-white/80">{g.needDetails}</p>
        {missing.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            {missing.map((field) => (
              <li key={field} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {g.fields[field] ?? field}
              </li>
            ))}
          </ul>
        )}
        {/* returnTo brings them back here the moment the account is complete. */}
        <Link href="/account?returnTo=giveaway" className={`${ghost} mt-3`}>
          {g.goToAccount}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`${RESERVED} max-w-lg`}>
      <label htmlFor="giveaway-handle" className="block text-sm font-semibold text-white">
        {g.handleLabel}
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex min-w-0 flex-1 items-center">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute start-4 text-sm text-white/50"
          >
            @
          </span>
          <input
            id="giveaway-handle"
            value={handle}
            onChange={(e) => {
              setHandle(e.target.value);
              try {
                sessionStorage.setItem(DRAFT_KEY, e.target.value);
              } catch {
                /* private mode: the draft simply is not kept */
              }
            }}
            placeholder={g.handlePlaceholder}
            autoComplete="off"
            spellCheck={false}
            dir="ltr"
            className="w-full min-w-0 rounded-full border border-white/20 bg-white/10 ps-8 pe-5 py-3.5 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-gold/60"
          />
        </div>
        <button type="submit" disabled={busy || !handle.trim()} className={`${cta} disabled:opacity-60`}>
          {busy ? g.submitting : g.submit}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2.5 text-xs font-medium text-red-300">
          {error}
        </p>
      )}
      <p className="mt-2.5 text-xs text-white/55">{g.handleHint}</p>
    </form>
  );
}
