"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { formatMoney } from "@/lib/format";
import { HeartIcon, StarIcon } from "@/components/icons";
import { AddToCartButton } from "@/components/home/AddToCartButton";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { useFly } from "@/components/fx/FlyProvider";

/**
 * Premium product card. On hover, gold corner brackets slide outward into a
 * focus frame ("corners move"). Labels are passed in already localized.
 */
export function ProductCard({
  product,
  bestsellerLabel,
  wishlistLabel,
}: {
  product: Product;
  bestsellerLabel: string;
  wishlistLabel: string;
}) {
  const filled = Math.round(product.rating);
  const { has, toggle } = useWishlist();
  const { fly } = useFly();
  const wished = has(product.id);

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-elevation)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-14px_rgba(64,47,117,0.4)]">
      {/* Corner brackets — slide outward + fade in on hover ("corners move") */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1.5 top-1.5 z-[4] h-5 w-5 translate-x-1.5 translate-y-1.5 rounded-tl-lg border-l-2 border-t-2 border-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-1.5 top-1.5 z-[4] h-5 w-5 -translate-x-1.5 translate-y-1.5 rounded-tr-lg border-r-2 border-t-2 border-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1.5 left-1.5 z-[4] h-5 w-5 translate-x-1.5 -translate-y-1.5 rounded-bl-lg border-b-2 border-l-2 border-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1.5 right-1.5 z-[4] h-5 w-5 -translate-x-1.5 -translate-y-1.5 rounded-br-lg border-b-2 border-r-2 border-gold opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
      />

      {/* Image — inset rounded container. One shared sample device image for
          every card; swap for a real per-product photo later. */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface-2">
        {product.image?.startsWith("http") ? (
          // Real catalogue photo through next/image: the source is a ~200KB PNG, the card needs
          // ~300px — the optimizer serves a cached AVIF/WebP a tenth the size. The backend keeps
          // presigned URLs stable for ~4h, so the variant cache gets real hits.
          // object-CONTAIN on a white tile, never object-cover: a product shot exists to show the
          // whole product, and cover crops it into a zoomed corner. White stays white in dark mode
          // too — a photo's own background does not theme.
          <Image
            src={product.image}
            alt={product.name}
            fill
            quality={75}
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
            className="bg-white object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
            draggable={false}
          />
        ) : (
          <Image
            src="/mock/product-hero.jpg"
            alt=""
            fill
            quality={90}
            sizes="300px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        )}

        {/* Badge (start) */}
        {product.bestseller ? (
          <span className="absolute start-3 top-3 z-[1] inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-warn shadow-sm backdrop-blur-sm dark:bg-black/75 dark:text-gold">
            {bestsellerLabel}
          </span>
        ) : product.discount > 0 ? (
          <span className="absolute start-3 top-3 z-[1] inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-fg shadow-sm">
            -{product.discount}%
          </span>
        ) : null}

        {/* Product link (transparent overlay) */}
        <Link
          href={product.href}
          aria-label={product.name}
          className="absolute inset-0 z-[2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        />

        {/* Wishlist (end) */}
        <button
          type="button"
          onClick={(e) => {
            const willAdd = !wished;
            toggle(product.id);
            if (willAdd) fly(e.currentTarget, "wishlist");
          }}
          aria-label={`${wishlistLabel}: ${product.name}`}
          aria-pressed={wished}
          className={`absolute end-3 top-3 z-[3] flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            wished
              ? "bg-white text-brand dark:bg-black/80"
              : "bg-white/85 text-brand-icon hover:bg-white hover:text-brand dark:bg-black/60"
          }`}
        >
          <HeartIcon
            className={`h-[18px] w-[18px] ${wished ? "fill-brand text-brand dark:fill-gold dark:text-gold" : ""}`}
          />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-1 pt-3.5">
        {/* Every block below reserves its height even when its content is short or absent, so the
            price row and the button sit at identical positions on every card in a row — a card
            with no specs must not be shorter than its neighbours. */}
        <p className="min-h-4 text-[11px] font-semibold uppercase tracking-wider text-warn dark:text-gold">
          {product.category || "\u00a0"}
        </p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.8rem] text-base font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted">
          {product.description}
        </p>

        {/* Feature chips — the row keeps its height when a product has none */}
        <div className="mt-3 flex min-h-[38px] flex-wrap gap-1.5 overflow-hidden pb-3">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-brand-soft px-2 py-1 text-xs font-medium text-brand-icon"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price + rating */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1 border-t border-border pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2" dir="ltr">
            {product.oldPrice > product.price && (
              <span className="text-xs text-muted line-through">
                {formatMoney(product.oldPrice, product.currency)}
              </span>
            )}
            <span className="text-xl font-bold tracking-tight text-foreground">
              {formatMoney(product.price, product.currency)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-3.5 w-3.5 ${i < filled ? "text-gold" : "text-border-strong"}`}
                />
              ))}
            </span>
            <span className="text-sm font-medium text-foreground">
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Add to cart */}
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
