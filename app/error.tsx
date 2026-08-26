"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * The app had no error boundary, so any throw anywhere in a client component fell through to
 * Next's own bare screen — an unbranded "could not open this page" with a reload button, no way
 * back into the site, and nothing said about what went wrong. A customer hitting that mid-flow has
 * no reason to believe the site works at all.
 *
 * Deliberately dependency-free: no i18n hook, no providers, no shared layout components. A boundary
 * that renders through the same machinery that just failed can fail again while rendering, and then
 * the visitor gets the bare screen anyway. Colours come from the theme tokens, which are plain CSS.
 *
 * The message is shown rather than hidden. Not for the customer's benefit — for the person they
 * forward the screenshot to.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[buyology] unhandled error", error);
  }, [error]);

  return (
    <main
      style={{ background: "var(--background)", color: "var(--foreground)" }}
      className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Buyology</p>
      <h1 className="mt-4 max-w-lg text-2xl font-semibold [text-wrap:balance] sm:text-3xl">
        Something went wrong on this page
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Your account and any order or request you have already submitted are safe — this is a
        problem displaying the page, not with your data.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-2"
        >
          Go to homepage
        </Link>
        <Link
          href="/support"
          className="rounded-full px-4 py-2.5 text-sm font-semibold text-brand-icon transition-colors hover:underline"
        >
          Contact support
        </Link>
      </div>

      {(error.message || error.digest) && (
        <details className="mt-10 max-w-lg text-start">
          <summary className="cursor-pointer text-xs text-muted">Technical details</summary>
          <p
            className="mt-2 overflow-x-auto rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted"
            dir="ltr"
          >
            {error.message}
            {error.digest ? ` (${error.digest})` : ""}
          </p>
        </details>
      )}
    </main>
  );
}
