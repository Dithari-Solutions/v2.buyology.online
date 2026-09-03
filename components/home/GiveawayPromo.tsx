"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import {
  fetchGiveawayCampaign,
  fetchGiveawayStatus,
} from "@/lib/giveaway-api";
import {
  ArrowRightShortIcon,
  CloseIcon,
  InstagramIcon,
  SparklesIcon,
  UserIcon,
} from "@/components/icons";

/** Dismissed once, dismissed for good on this device. A prompt that keeps coming back is an ad. */
const DISMISS_KEY = "buyo_giveaway_promo_dismissed";
/** Long enough for the page to finish painting and for the visitor to see what they came for. */
const DELAY_MS = 2600;

/** Nothing interrupts someone mid-sign-up, and the home page already leads with the full banner. */
const SILENT_ROUTES = new Set(["/", "/login", "/signup", "/forgot-password"]);

function alreadyDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    // Private mode, storage disabled: fail closed. Better to never prompt than to prompt on
    // every page load with no way to make it stop.
    return true;
  }
}

function remember() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* nothing to do — the visitor closes it again next time */
  }
}

/**
 * The giveaway, for people who never reach the home page.
 *
 * Most traffic lands on a product or a search result, so the banner that opens the home page is
 * seen by a minority of visitors. This says the same thing once, everywhere else, and then never
 * again: closing it is permanent on that device, and entering the draw counts as closing it.
 *
 * It stays quiet when there is nothing to say — a closed draw, an unreachable API, an account
 * that has already entered — because the alternative is advertising a draw someone cannot join.
 */
export function GiveawayPromo() {
  const { t } = useI18n();
  const g = t.giveaway;
  const { status: authStatus } = useAuth();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    remember();
  }, []);

  useEffect(() => {
    if (!pathname || SILENT_ROUTES.has(pathname)) return;
    // Wait for auth to settle: asking the server whether this account has entered is pointless
    // while we still don't know whether there is an account.
    if (authStatus === "loading") return;
    if (alreadyDismissed()) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const campaign = await fetchGiveawayCampaign();
      if (cancelled || !campaign?.open) return;

      if (authStatus === "authed") {
        try {
          const mine = await fetchGiveawayStatus();
          if (cancelled) return;
          if (mine.entered) {
            // They are in the draw. Never prompt them again, on this or any later page.
            remember();
            return;
          }
        } catch {
          // Status unknown — show it. The worst case is a redundant nudge, and the entry form
          // itself tells an entered customer they are already in.
        }
      }

      if (!cancelled) setOpen(true);
    }, DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [authStatus, pathname]);

  // Escape closes it, and the page behind stops scrolling while it is up.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  const steps = [
    { icon: UserIcon, title: g.step1Title, body: g.step1Body },
    { icon: InstagramIcon, title: g.step2Title, body: g.step2Body },
  ];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="giveaway-promo-title"
    >
      {/* Clicking away is the second way out, for anyone who does not look for the button. */}
      <button
        type="button"
        aria-label={g.promoClose}
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-[2px] buyo-overlay"
      />

      <div className="buyo-giveaway-ground relative isolate w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/15 text-white shadow-2xl buyo-sheet sm:rounded-3xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -end-10 -top-16 h-56 w-56 rounded-full bg-gold/25 blur-[70px]" />
          <div className="absolute -bottom-20 start-1/4 h-52 w-52 rounded-full bg-brand/45 blur-[80px]" />
          <div className="buyo-dot-grid absolute inset-0 opacity-[0.12]" />
        </div>

        <button
          type="button"
          onClick={close}
          aria-label={g.promoClose}
          className="absolute end-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 transition-colors hover:bg-black/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-[minmax(0,1fr)_104px] items-center gap-4 p-6 sm:grid-cols-[minmax(0,1fr)_132px] sm:p-7">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-fg">
              <SparklesIcon className="h-3 w-3" />
              {g.eyebrow}
            </p>
            <h2
              id="giveaway-promo-title"
              className="mt-3.5 text-2xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-3xl"
            >
              {g.title} <span className="text-gold">{g.prize}</span>
            </h2>
          </div>

          <div className="pointer-events-none relative h-32 w-full sm:h-40">
            <div
              aria-hidden="true"
              className="absolute start-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-[45px]"
            />
            <Image
              src="/mock/iphone-18-pro.png"
              alt=""
              fill
              sizes="132px"
              className="rotate-[12deg] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)] rtl:-rotate-[12deg]"
            />
          </div>
        </div>

        <div className="px-6 pb-6 sm:px-7 sm:pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
            {g.stepsLabel}
          </p>
          <ol className="mt-2.5 grid gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/[0.07] p-3.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-fg">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4 shrink-0 text-gold" />
                      {s.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-white/65">{s.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <Link
            href="/#giveaway"
            onClick={close}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {g.cta}
            <ArrowRightShortIcon className="h-4 w-4 rtl:rotate-180" />
          </Link>

          <button
            type="button"
            onClick={close}
            className="mt-2 w-full rounded-full px-6 py-2.5 text-xs font-semibold text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {g.promoDismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
