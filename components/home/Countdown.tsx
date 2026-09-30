"use client";

import { useNow } from "@/hooks/useNow";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const box =
  "inline-flex min-w-[28px] items-center justify-center rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-sm font-semibold tabular-nums text-warn dark:text-gold";

/**
 * Live HH:MM:SS countdown to an ABSOLUTE instant chosen by the server (flashSaleEndsAt).
 *
 * This used to take a fixed hours/minutes/seconds duration, and the reason was hydration: the time
 * remaining is a function of the clock, so a server render and the client's first render disagree by
 * construction and React reports a mismatch. A real sale ends at a real moment, so the duration had
 * to go — and the mismatch is now handled rather than avoided. {@link useNow} reports 0 until the
 * clock is running (server render, hydrating render) and this renders a stable "--" for it, then
 * ticks. Do NOT "simplify" this by computing the remainder from `Date.now()` during render: that is
 * precisely the hydration error the placeholder exists to prevent.
 *
 * Reaching zero is the CALLER's business. This keeps rendering 00:00:00 for as long as it stays
 * mounted; the flash-sale rail watches the same clock and unmounts the row whose sale has ended, so
 * nothing is left sitting at zero still advertising a discount.
 */
export function Countdown({ endsAt }: { endsAt: string }) {
  const now = useNow();
  const target = Date.parse(endsAt);
  const total =
    now > 0 && Number.isFinite(target) ? Math.max(0, Math.floor((target - now) / 1000)) : null;

  const [h, m, s] =
    total === null
      ? ["--", "--", "--"]
      : [pad(Math.floor(total / 3600)), pad(Math.floor((total % 3600) / 60)), pad(total % 60)];

  return (
    <span
      className="inline-flex items-center gap-1"
      dir="ltr"
      role="timer"
      aria-label={`${h}:${m}:${s}`}
    >
      <span className={box}>{h}</span>
      <span className="text-muted">:</span>
      <span className={box}>{m}</span>
      <span className="text-muted">:</span>
      <span className={box}>{s}</span>
    </span>
  );
}
