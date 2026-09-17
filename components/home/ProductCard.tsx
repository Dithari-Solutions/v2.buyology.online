"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { formatMoney } from "@/lib/format";
import { HeartIcon, StarIcon } from "@/components/icons";
import { AddToCartButton } from "@/components/home/AddToCartButton";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { useFly } from "@/components/fx/FlyProvider";
import { RefurbishedBadge } from "@/components/product/RefurbishedBadge";

/**
 * Premium product card. On hover, gold corner brackets slide outward into a
 * focus frame ("corners move"). Labels are passed in already localized.
 */
export function ProductCard({
  product,
  bestsellerLabel,
  refurbishedLabel,
  wishlistLabel,
}: {
  product: Product;
  bestsellerLabel: string;
  refurbishedLabel: string;
  wishlistLabel: string;
}) {
  const filled = Math.round(product.rating);
  const { has, toggle } = useWishlist();
  const { fly } = useFly();
  const wished = has(product.id);

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-border bg-surface p-2 sm:rounded-2xl sm:p-3 shadow-[var(--shadow-elevation)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-14px_rgba(64,47,117,0.4)]">
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
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-2 sm:aspect-[4/3] sm:rounded-xl">
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
            className="bg-white object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03] sm:p-3"
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
          <span className="absolute start-2 top-2 z-[1] inline-flex items-center rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-warn shadow-sm backdrop-blur-sm sm:start-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px] dark:bg-black/75 dark:text-gold">
            {bestsellerLabel}
          </span>
        ) : product.discount > 0 ? (
          <span className="absolute start-2 top-2 z-[1] inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-fg shadow-sm sm:start-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
            -{product.discount}%
          </span>
        ) : null}

        {/* Refurbished seal — bottom corner, so it never competes with the bestseller/discount badge
            or the wishlist button along the top. On the photo rather than in the text rows below,
            which hold fixed heights to keep a row of cards aligned. Beneath the card-wide link layer,
            so clicking it opens the product like the rest of the photo. */}
        {product.refurbished && (
          <RefurbishedBadge
            label={refurbishedLabel}
            className="absolute bottom-2 start-2 z-[1] sm:bottom-3 sm:start-3"
          />
        )}

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
          className={`absolute end-2 top-2 z-[3] flex h-8 w-8 items-center justify-center rounded-full sm:end-3 sm:top-3 sm:h-9 sm:w-9 shadow-sm backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            wished
              ? "bg-white text-brand dark:bg-black/80"
              : "bg-white/85 text-brand-icon hover:bg-white hover:text-brand dark:bg-black/60"
          }`}
        >
          <HeartIcon
            className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${wished ? "fill-brand text-brand dark:fill-gold dark:text-gold" : ""}`}
          />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-1 pt-2.5 sm:pt-3.5">
        {/* Every block below reserves its height even when its content is short or absent, so the
            price row and the button sit at identical positions on every card in a row — a card
            with no specs must not be shorter than its neighbours.

            On a phone the card is ~170px wide, two to a row, and carrying everything read as a wall
            of text. Below sm it shows only what decides a tap — photo, name, price, button — and
            leaves the category, description and spec chips to the product page. */}
        <p className="hidden min-h-4 text-[11px] font-semibold uppercase tracking-wider text-warn sm:block dark:text-gold">
          {product.category || "\u00a0"}
        </p>
        {/* The link lives on the name and stretches over the whole card (::after), so clicking
            the name, the description or the photo all open the product. Controls that do
            something else — wishlist, add to cart — sit above it on a higher layer. */}
        {/* The box is exactly two lines tall. leading-snug needs the important flag: the global
            heading rule in globals.css (line-height 1.04) is unlayered and outranks any utility, and
            at 1.04 the two-line box has room for the top of a third line under the ellipsis. */}
        <h3 className="line-clamp-2 h-[2.25rem] text-[13px] font-semibold leading-snug! text-foreground sm:mt-1 sm:h-[2.75rem] sm:text-base">
          <Link
            href={product.href}
            className="after:absolute after:inset-0 after:z-[2] after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 hidden min-h-10 text-sm text-muted sm:line-clamp-2">
          {product.description}
        </p>

        {/* Feature chips — the row keeps its height when a product has none */}
        <div className="mt-3 hidden min-h-[38px] flex-wrap gap-1.5 overflow-hidden pb-3 sm:flex">
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
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 pt-2 sm:items-end sm:gap-x-3 sm:gap-y-1 sm:border-t sm:border-border sm:pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2" dir="ltr">
            {product.oldPrice > product.price && (
              <span className="text-[11px] text-muted line-through sm:text-xs">
                {formatMoney(product.oldPrice, product.currency)}
              </span>
            )}
            <span className="text-base font-bold tracking-tight text-foreground sm:text-xl">
              {formatMoney(product.price, product.currency)}
            </span>
          </div>
          {/* Only once somebody has actually reviewed it. A product with no reviews was showing five
              grey stars and "0.0", which reads as a bad score rather than as no data — and 0 is
              indistinguishable from unknown here on purpose: the backend writes zeros when a product
              has no stats row, and the mapper coalesces nulls, so `reviews > 0` is the only usable
              test. This cluster shares a row with the price, which sets the row's height, so dropping
              it does not shorten the card or break the grid alignment the blocks above maintain. */}
          {product.reviews > 0 && (
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <span className="flex items-center gap-0.5" aria-hidden="true">
                <StarIcon className="h-3.5 w-3.5 text-gold" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`hidden h-3.5 w-3.5 sm:block ${
                      i + 1 < filled ? "text-gold" : "text-border-strong"
                    }`}
                  />
                ))}
              </span>
              <span className="text-xs font-medium text-foreground sm:text-sm">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Above the card-wide product link, or it would just open the product. */}
        <div className="relative z-[3]">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
