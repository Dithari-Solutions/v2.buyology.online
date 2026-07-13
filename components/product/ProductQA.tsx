"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { questions } from "@/lib/product-detail";
import { MessageIcon, ThumbUpIcon } from "@/components/icons";

function QaItem({ item }: { item: (typeof questions)[number] }) {
  const { t } = useI18n();
  const [voted, setVoted] = useState(false);

  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand-icon">
          Q
        </span>
        <p className="pt-1 font-semibold text-foreground">{item.q}</p>
      </div>
      <div className="mt-3 flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-sm font-bold text-warn dark:text-gold">
          A
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted">{item.a}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="font-medium text-foreground">{item.answerer}</span>
            <span>· {item.date}</span>
            <button
              type="button"
              onClick={() => setVoted((v) => !v)}
              aria-pressed={voted}
              className={`ms-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                voted ? "text-brand" : "hover:text-foreground"
              }`}
            >
              <ThumbUpIcon className="h-3.5 w-3.5" />
              {item.votes + (voted ? 1 : 0)} {t.pdp.qa.votes}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductQA() {
  const { t } = useI18n();

  return (
    <section aria-labelledby="qa-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="qa-heading"
          className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          <MessageIcon className="h-5 w-5 text-brand-icon" />
          {t.pdp.qa.title}
        </h2>
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.pdp.qa.ask}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {questions.map((item) => (
          <QaItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
