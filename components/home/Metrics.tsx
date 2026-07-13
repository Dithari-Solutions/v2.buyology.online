"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import {
  metrics,
  REVIEW_COUNT,
  REVIEW_DISTRIBUTION,
  REVIEW_SCORE,
} from "@/lib/metrics";
import { StarIcon } from "@/components/icons";
import { formatInt } from "@/lib/format";

type Kind = "compact" | "percent" | "decimal";

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function format(n: number, kind: Kind) {
  if (kind === "compact") return compact.format(Math.max(0, Math.round(n)));
  return n.toFixed(1); // percent & decimal
}

/**
 * Counts up to `value` once scrolled into view, writing straight to the DOM
 * node (no re-render). Respects reduced motion and degrades to the final value
 * with no JS.
 */
function CountUp({
  value,
  kind,
  className,
}: {
  value: number;
  kind: Kind;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = format(value, kind);
      return;
    }
    el.textContent = format(0, kind);
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1500;
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = format(value * eased, kind);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [value, kind]);

  return (
    <span ref={ref} className={className}>
      {format(value, kind)}
    </span>
  );
}

/**
 * "By the numbers" — social-proof metrics shown under the Buyology AI section:
 * a featured aggregate review score (with a rating distribution) plus headline
 * counters that animate up on scroll.
 */
export function Metrics() {
  const { t } = useI18n();
  const filled = Math.round(REVIEW_SCORE);

  return (
    <section
      aria-labelledby="metrics-heading"
      className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12"
    >
      {/* Header */}
      <div className="mb-6 max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted">
          <StarIcon className="h-4 w-4 text-gold" />
          {t.metrics.eyebrow}
        </p>
        <h2
          id="metrics-heading"
          className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {t.metrics.heading}
        </h2>
        <p className="mt-2 text-muted">{t.metrics.subline}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        {/* Featured review score */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-elevation)]">
          <div className="flex items-end gap-1">
            <CountUp
              value={REVIEW_SCORE}
              kind="decimal"
              className="text-5xl font-bold tracking-tight text-foreground tabular-nums"
            />
            <span className="mb-1.5 text-sm font-medium text-muted">
              {t.metrics.outOf}
            </span>
          </div>
          <span className="mt-2 flex items-center gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${i < filled ? "text-gold" : "text-border-strong"}`}
              />
            ))}
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">
            {t.metrics.scoreLabel}
          </p>
          <p className="text-sm text-muted">
            {formatInt(REVIEW_COUNT)} {t.metrics.reviewsSuffix}
          </p>

          {/* Rating distribution */}
          <div className="mt-4 space-y-1.5">
            {REVIEW_DISTRIBUTION.map((pct, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex w-6 items-center gap-0.5 text-xs font-medium tabular-nums text-muted">
                  {5 - i}
                  <StarIcon className="h-3 w-3 text-gold" />
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className="block h-full rounded-full bg-gold"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span className="w-9 text-end text-xs tabular-nums text-muted">
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Metric tiles */}
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.key}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-elevation)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-icon">
                  <Icon className="h-[22px] w-[22px]" />
                </span>
                <div className="mt-4">
                  <p className="flex items-baseline text-3xl font-bold tracking-tight text-foreground tabular-nums">
                    <CountUp value={m.to} kind={m.kind} />
                    {m.kind === "percent" && <span>%</span>}
                    {m.suffix && <span>{m.suffix}</span>}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t.metrics.items[m.key]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
