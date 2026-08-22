"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { useProduct } from "@/components/product/product-context";
import { fetchReviews, type Review } from "@/lib/catalogue";
import { formatInt } from "@/lib/format";
import { StarIcon } from "@/components/icons";

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

function initialsOf(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || "•";
}

/**
 * Real, approved customer reviews. The overview keeps the average + count from the product's own
 * pre-aggregated stats; the star-distribution histogram is gone — the backend does not expose one,
 * and inventing percentages under real reviews would be fabrication. The rating bars come back the
 * day the API aggregates them.
 */
export function ProductReviews() {
  const { t, locale } = useI18n();
  const { product } = useProduct();
  const [rows, setRows] = useState<Review[] | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchReviews(locale, product.id, 0).then((list) => {
      if (cancelled) return;
      setRows(list);
      setHasMore(list.length === 10);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, product.id]);

  async function loadMore() {
    const next = page + 1;
    const list = await fetchReviews(locale, product.id, next);
    setRows((prev) => [...(prev ?? []), ...list]);
    setPage(next);
    setHasMore(list.length === 10);
  }

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );

  return (
    <section aria-labelledby="reviews-heading" id="reviews" className="scroll-mt-40">
      <h2
        id="reviews-heading"
        className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {t.pdp.reviews.title}
      </h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        {/* Overview — the product's own aggregated stats. */}
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
            {t.pdp.reviews.basedOn} {formatInt(product.reviews)} {t.cart.reviews}
          </p>
        </div>

        {/* List */}
        <div>
          {rows === null ? (
            <div className="space-y-4" aria-busy>
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface px-5 py-8 text-center text-sm text-muted">
              {t.pdp.reviews.basedOn} 0 {t.cart.reviews}
            </p>
          ) : (
            <>
              {rows.map((review) => (
                <article key={review.id} className="border-t border-border py-6 first:border-t-0 first:pt-0">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-icon">
                      {initialsOf(review.reviewerName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-foreground">
                          {review.reviewerName ?? "—"}
                        </span>
                        {review.createdAt && (
                          <span className="text-xs text-muted">
                            · {dateFmt.format(new Date(review.createdAt))}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <Stars rating={review.rating} className="h-3.5 w-3.5" />
                      </div>
                      {review.title && (
                        <h3 className="mt-2 font-semibold text-foreground">{review.title}</h3>
                      )}
                      {review.comment && (
                        <p className="mt-1 text-sm text-muted">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  className="mt-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
                >
                  {t.shop.loadMore}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
