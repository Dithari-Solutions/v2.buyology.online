"use client";

import { useState } from "react";
import { getProduct } from "@/lib/products";
import { useI18n } from "@/components/i18n/language-provider";
import { reviews, reviewDistribution } from "@/lib/product-detail";
import { formatInt } from "@/lib/format";
import { CheckIcon, StarIcon, ThumbUpIcon } from "@/components/icons";

function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`${className} ${i < filled ? "text-gold" : "text-border-strong"}`}
        />
      ))}
    </span>
  );
}

function ReviewCard({
  review,
}: {
  review: (typeof reviews)[number];
}) {
  const { t } = useI18n();
  const [voted, setVoted] = useState(false);

  return (
    <article className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-icon">
          {review.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-foreground">{review.author}</span>
            {review.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <CheckIcon className="h-3.5 w-3.5" />
                {t.pdp.reviews.verified}
              </span>
            )}
            <span className="text-xs text-muted">· {review.date}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Stars rating={review.rating} className="h-3.5 w-3.5" />
          </div>
          <h3 className="mt-2 font-semibold text-foreground">{review.title}</h3>
          <p className="mt-1 text-sm text-muted">{review.body}</p>

          <button
            type="button"
            onClick={() => setVoted((v) => !v)}
            aria-pressed={voted}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              voted
                ? "border-brand bg-brand-soft text-brand-icon"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            <ThumbUpIcon className="h-3.5 w-3.5" />
            {t.pdp.reviews.helpful} ({review.helpful + (voted ? 1 : 0)})
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const { t } = useI18n();
  const product = getProduct(productId);
  if (!product) return null;

  return (
    <section aria-labelledby="reviews-heading" id="reviews" className="scroll-mt-40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id="reviews-heading"
          className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          {t.pdp.reviews.title}
        </h2>
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.pdp.reviews.write}
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        {/* Overview */}
        <div className="h-fit rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
              {product.rating.toFixed(1)}
            </span>
            <span className="mb-1 text-sm text-muted">{t.metrics.outOf}</span>
          </div>
          <div className="mt-1.5">
            <Stars rating={product.rating} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {t.pdp.reviews.basedOn} {formatInt(product.reviews)}{" "}
            {t.cart.reviews}
          </p>

          <div className="mt-4 space-y-1.5">
            {reviewDistribution.map((pct, i) => (
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
                <span className="w-9 text-end text-xs text-muted tabular-nums">
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* List */}
        <div>
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
