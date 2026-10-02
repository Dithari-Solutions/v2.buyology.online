"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { CheckIcon, CloseIcon, UserIcon } from "@/components/icons";

/** Time on the site before a guest is invited to register. */
const DELAY_MS = 2 * 60_000;
/** Closing it keeps it away this long on the device — an invitation, not a nag. */
const SNOOZE_MS = 7 * 24 * 60 * 60_000;
/** How often to look again while another dialog is in the way. */
const RETRY_MS = 3_000;

/** When this visit began. sessionStorage, so a reload keeps the clock and a new visit restarts it. */
const SINCE_KEY = "buyo_signup_prompt_since";
const DISMISSED_KEY = "buyo_signup_prompt_dismissed_at";

/** Nobody is interrupted while signing in or paying, nor on the region landing, which is no store. */
const SILENT_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/global-welcome", "/cart"]);
const SILENT_PREFIXES = ["/checkout", "/payment"];

function isSilent(pathname: string): boolean {
  return SILENT_ROUTES.has(pathname) || SILENT_PREFIXES.some((p) => pathname.startsWith(p));
}

/** Read the visit's start, or stamp it now. Null when storage is unavailable. */
function visitStart(): number | null {
  try {
    const stored = Number(sessionStorage.getItem(SINCE_KEY));
    if (stored > 0) return stored;
    const now = Date.now();
    sessionStorage.setItem(SINCE_KEY, String(now));
    return now;
  } catch {
    return null;
  }
}

function snoozed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY));
    return at > 0 && Date.now() - at < SNOOZE_MS;
  } catch {
    // Storage disabled: fail closed, as GiveawayPromo does. Without a way to remember the close,
    // it would come back on every visit.
    return true;
  }
}

function snooze() {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    /* already unreachable — snoozed() fails closed */
  }
}

/**
 * Another dialog is up: the giveaway, the cart, search, a story, the chat panel. One interruption
 * at a time, and nobody mid-conversation with the assistant is talked over.
 */
function dialogOpen(): boolean {
  return document.querySelector('[role="dialog"]') !== null;
}

/**
 * Invites a guest to create an account once they have spent two minutes on the site.
 *
 * The clock is the visit's, not the page's: the root layout keeps this mounted across client
 * navigations, and the start time lives in sessionStorage so a reload does not reset it. Signed-in
 * visitors never see it, and closing it — or following either link — snoozes it for a week.
 */
export function SignupPrompt() {
  const { t } = useI18n();
  const p = t.auth.prompt;
  const { status: authStatus } = useAuth();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  /** Where to come back to after signing up — captured when it opens, so it is the page they were on. */
  const [returnTo, setReturnTo] = useState("/");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Signing in or reaching a quiet route hides it without counting as a dismissal.
  const visible = open && authStatus === "guest" && !!pathname && !isSilent(pathname);

  const close = useCallback(() => {
    setOpen(false);
    snooze();
  }, []);

  useEffect(() => {
    // Stamped on the first render, whatever the route or auth state, so the two minutes are real.
    const since = visitStart();
    if (open || since === null || !pathname || isSilent(pathname)) return;
    if (authStatus !== "guest" || snoozed()) return;

    let timer: ReturnType<typeof setTimeout>;
    const attempt = () => {
      if (dialogOpen()) {
        timer = setTimeout(attempt, RETRY_MS);
        return;
      }
      setReturnTo(window.location.pathname + window.location.search);
      setOpen(true);
    };
    timer = setTimeout(attempt, Math.max(0, since + DELAY_MS - Date.now()));
    return () => clearTimeout(timer);
  }, [authStatus, pathname, open]);

  // Escape closes it, the page behind stops scrolling, and focus returns where it was.
  useEffect(() => {
    if (!visible) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const unlock = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      unlock();
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [visible, close]);

  function trapTab(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
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

  if (!visible) return null;

  const next = encodeURIComponent(returnTo);
  const benefits = [p.benefits.orders, p.benefits.addresses, p.benefits.wishlist];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-prompt-title"
      aria-describedby="signup-prompt-body"
    >
      <div className="buyo-overlay absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

      <div
        ref={panelRef}
        onKeyDown={trapTab}
        className="buyo-sheet relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-elevated p-6 shadow-[var(--shadow-overlay)] sm:rounded-2xl sm:p-7"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label={p.close}
          className="absolute end-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-foreground">
          <UserIcon className="h-5 w-5" />
        </span>

        <h2
          id="signup-prompt-title"
          className="mt-4 pe-8 text-xl font-bold tracking-tight text-foreground"
        >
          {p.title}
        </h2>
        <p id="signup-prompt-body" className="mt-2 text-sm leading-relaxed text-muted">
          {p.body}
        </p>

        <ul className="mt-4 grid gap-2.5">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
              {b}
            </li>
          ))}
        </ul>

        <Link
          href={`/signup?next=${next}`}
          onClick={close}
          className="mt-6 block w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t.auth.signup.submit}
        </Link>

        <p className="mt-4 text-center text-sm text-muted">
          {t.auth.signup.hasAccount}{" "}
          <Link
            href={`/login?next=${next}`}
            onClick={close}
            className="rounded font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.auth.signup.cta}
          </Link>
        </p>
      </div>
    </div>
  );
}
