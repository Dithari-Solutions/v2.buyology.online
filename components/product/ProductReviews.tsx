"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useProduct } from "@/components/product/product-context";
import { fetchReviews, type Review } from "@/lib/catalogue";
import {
  hasReviewedProduct,
  submitReview,
  MAX_REVIEW_IMAGES,
  MAX_REVIEW_IMAGE_BYTES,
} from "@/lib/review-api";
import { AuthError } from "@/lib/auth/client";
import { formatInt } from "@/lib/format";
import { CloseIcon, StarIcon } from "@/components/icons";

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

function StarInput({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-pressed={value === n}
          aria-label={`${n}/5`}
          onClick={() => onChange(n)}
          className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <StarIcon
            className={`h-7 w-7 transition-colors ${n <= value ? "text-gold" : "text-border-strong hover:text-gold/60"}`}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Write-a-review card. Signed-out visitors get a sign-in link; a signed-in customer who
 * already reviewed sees that instead of the form (one review per product, ever — the server
 * enforces it with a unique constraint). Submissions go live immediately.
 */
function WriteReview({ productId, onPosted }: { productId: string; onPosted: () => void }) {
  const { t } = useI18n();
  const r = t.pdp.reviews;
  const { status, user } = useAuth();
  const [already, setAlready] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== "authed" || !user?.uid) return;
    let cancelled = false;
    hasReviewedProduct(user.uid, productId)
      .then((yes) => {
        if (!cancelled) setAlready(yes);
      })
      .catch(() => {
        if (!cancelled) setAlready(false); // form shows; a duplicate submit maps the 409
      });
    return () => {
      cancelled = true;
    };
  }, [status, user?.uid, productId]);

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  if (status === "loading") return null;
  if (status === "guest") {
    return (
      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">{r.signInToReview}</p>
        <Link
          href={`/login?next=/product/${productId}`}
          className="mt-3 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.auth.login.submit}
        </Link>
      </div>
    );
  }
  if (posted || already === true) {
    return (
      <p className="mt-4 rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-muted">
        {posted ? r.posted : r.alreadyReviewed}
      </p>
    );
  }
  if (already === null) return null;

  function pick(list: FileList | null) {
    if (!list) return;
    setError(null);
    const picked = Array.from(list);
    if (picked.some((f) => f.size > MAX_REVIEW_IMAGE_BYTES)) setError(r.errFileSize);
    const merged = [
      ...files,
      ...picked.filter((f) => f.type.startsWith("image/") && f.size <= MAX_REVIEW_IMAGE_BYTES),
    ].slice(0, MAX_REVIEW_IMAGES);
    setFiles(merged);
    previews.forEach((u) => URL.revokeObjectURL(u));
    setPreviews(merged.map((f) => URL.createObjectURL(f)));
    if (inputRef.current) inputRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || rating === 0 || !user?.credentialId) return;
    setBusy(true);
    setError(null);
    try {
      await submitReview({
        productId,
        credentialId: user.credentialId,
        rating,
        body: body.trim() || undefined,
        images: files,
      });
      setPosted(true);
      onPosted();
    } catch (err) {
      if (err instanceof AuthError && err.status === 409) {
        setAlready(true);
      } else {
        // 400s are the content filter / file checks — localized summary, never raw English.
        setError(err instanceof AuthError && err.status === 400 ? r.errContent : r.errGeneric);
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-semibold text-foreground">{r.write}</h3>
      <div className="mt-3">
        <StarInput value={rating} onChange={setRating} label={r.ratingLabel} />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={r.bodyPlaceholder}
        rows={3}
        className="mt-3 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => pick(e.target.files)}
          className="hidden"
          id="review-photos"
        />
        <label
          htmlFor="review-photos"
          className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
        >
          {r.addPhoto} ({files.length}/{MAX_REVIEW_IMAGES})
        </label>
        {previews.map((src, i) => (
          <span key={src} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-14 w-14 rounded-xl border border-border object-cover" />
            <button
              type="button"
              aria-label={t.cart.remove}
              onClick={() => {
                URL.revokeObjectURL(previews[i]);
                setFiles(files.filter((_, k) => k !== i));
                setPreviews(previews.filter((_, k) => k !== i));
              }}
              className="absolute -end-1.5 -top-1.5 rounded-full bg-black/60 p-0.5 text-white"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={busy || rating === 0}
        className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? r.submitting : r.submit}
      </button>
    </form>
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
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchReviews(locale, product.id, 0).then((list) => {
      if (cancelled) return;
      setRows(list);
      setPage(0);
      setHasMore(list.length === 10);
    });
    return () => {
      cancelled = true;
    };
  }, [locale, product.id, refreshNonce]);

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
          <WriteReview
            productId={product.id}
            onPosted={() => setRefreshNonce((n) => n + 1)}
          />
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
