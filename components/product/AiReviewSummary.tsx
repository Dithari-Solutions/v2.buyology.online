"use client";

import { useI18n } from "@/components/i18n/language-provider";
import { aiSummary } from "@/lib/product-detail";
import { BotIcon, CheckIcon, SparklesIcon } from "@/components/icons";

const maxCount = Math.max(...aiSummary.themes.map((th) => th.count));

/** Buyobot-generated summary of the customer reviews (pros/cons/themes). */
export function AiReviewSummary() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="ai-summary-heading"
      className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-soft to-transparent p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-deep text-white">
          <BotIcon className="h-6 w-6" />
        </span>
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-warn dark:text-gold">
            <SparklesIcon className="h-3.5 w-3.5" />
            {t.pdp.ai.eyebrow}
          </p>
          <h2
            id="ai-summary-heading"
            className="text-lg font-semibold text-foreground"
          >
            {t.pdp.ai.title}
          </h2>
        </div>
        <span className="ms-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
          {aiSummary.positive}% {t.pdp.ai.positive}
        </span>
      </div>

      {/* Verdict */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {t.pdp.ai.verdict}
        </p>
        <p className="mt-1.5 text-foreground">{aiSummary.verdict}</p>
      </div>

      {/* Pros / Cons */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-foreground">{t.pdp.ai.pros}</p>
          <ul className="mt-3 space-y-2">
            {aiSummary.pros.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-foreground">{t.pdp.ai.cons}</p>
          <ul className="mt-3 space-y-2">
            {aiSummary.cons.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-muted">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warn dark:bg-gold"
                />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Themes */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-foreground">{t.pdp.ai.themes}</p>
        <div className="mt-3 space-y-2">
          {aiSummary.themes.map((th) => (
            <div key={th.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-foreground">
                {th.label}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-brand"
                  style={{ width: `${Math.round((th.count / maxCount) * 100)}%` }}
                />
              </span>
              <span className="w-24 text-end text-xs text-muted tabular-nums">
                {th.count.toLocaleString()} {t.pdp.ai.mentions}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted">
        <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-gold" />
        {t.pdp.ai.disclaimer}
      </p>
    </section>
  );
}
