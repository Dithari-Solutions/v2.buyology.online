"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { fetchOrders } from "@/lib/account-api";
import { LockIcon, PackageIcon, SearchIcon } from "@/components/icons";

const PAGE_SIZE = 50;
const MAX_PAGES = 10;

/**
 * Track an order by its code.
 *
 * Sign-in is required and the lookup only ever searches the CALLER'S OWN orders — that is the
 * validation. Matching a typed code against every order in the system would let anyone walk
 * the 8-character space and read a stranger's address and items; here an unknown code is
 * indistinguishable from someone else's code, because both simply are not in your list.
 *
 * Accepts what the customer actually has in front of them: the short code shown in the app
 * and in emails ("BUY-1A2B3C4D" or "1a2b3c4d"), with or without a leading '#', or the full
 * order id pasted from a link.
 */
export function TrackOrder() {
  const { t } = useI18n();
  const p = t.pages;
  const router = useRouter();
  const { status } = useAuth();

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Strip the decoration a customer may copy along with the code. */
  function normalize(raw: string): string {
    return raw
      .trim()
      .replace(/^#/, "")
      .replace(/^BUY[-\s]?/i, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const needle = normalize(code);
    if (busy || !needle) return;
    setBusy(true);
    setError(null);
    try {
      // Walk the customer's own order pages until the code matches one of them.
      for (let page = 0; page < MAX_PAGES; page += 1) {
        const data = await fetchOrders(page, PAGE_SIZE);
        const hit = data.content.find(
          (o) => o.id.toLowerCase() === needle || o.id.toLowerCase().startsWith(needle),
        );
        if (hit) {
          router.push(`/account/orders/${hit.id}`);
          return;
        }
        if (data.number + 1 >= data.totalPages) break;
      }
      setError(p.trackNotFound);
    } catch {
      setError(p.trackFailed);
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="h-40 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" aria-busy />
    );
  }

  // Signed out: say plainly that tracking needs an account, and why — the lookup only ever
  // searches the caller's own orders, which is what stops a stranger walking order codes.
  if (status === "guest") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-icon">
          <LockIcon className="h-6 w-6" />
        </span>
        <p className="text-lg font-semibold text-foreground">{p.trackSignInTitle}</p>
        <p className="max-w-md text-sm text-muted">{p.trackSignIn}</p>
        <div className="mt-1 flex flex-wrap justify-center gap-3">
          <Link
            href="/login?next=/track"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.auth.login.submit}
          </Link>
          <Link
            href="/signup?next=/track"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.auth.signup.submit}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <form onSubmit={submit}>
        <label htmlFor="track-code" className="block text-sm font-medium text-foreground">
          {p.trackCodeLabel}
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="track-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={p.trackCodePlaceholder}
            autoComplete="off"
            spellCheck={false}
            dir="ltr"
            className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SearchIcon className="h-4 w-4" />
            {busy ? p.trackSearching : p.trackSubmit}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">{p.trackCodeHint}</p>
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
      </form>

      <Link
        href="/account#orders"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-icon hover:underline"
      >
        <PackageIcon className="h-4 w-4" />
        {p.trackCta}
      </Link>
    </div>
  );
}
