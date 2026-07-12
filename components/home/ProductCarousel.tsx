"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { flashDeals } from "@/lib/products";
import { useI18n } from "@/components/i18n/language-provider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ProductCard } from "@/components/home/ProductCard";
import { Countdown } from "@/components/home/Countdown";
import {
  ArrowRightShortIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "@/components/icons";

const SPEED = 0.4; // px per frame — a slow, premium drift

/**
 * Flash-deals / trending rail. The track auto-scrolls forever (seamless because
 * the product list is duplicated and scrollLeft wraps at the midpoint). It
 * pauses on hover/focus/drag and via a persistent play/pause toggle (WCAG
 * 2.2.2). The arrows scroll a card at a time. RTL-aware; auto-scroll is disabled
 * under reduced-motion (manual scroll stays).
 */
export function ProductCarousel() {
  const { t, dir } = useI18n();
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false); // hover / focus
  const pointerRef = useRef(false); // active drag
  const accRef = useRef(0);
  const rtl = dir === "rtl";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const step = () => {
      if (playing && !hoverRef.current && !pointerRef.current && !reduced) {
        // Accumulate sub-pixel speed and apply whole pixels only — assigning a
        // fractional scrollLeft gets rounded away by the browser and never moves.
        accRef.current += SPEED;
        const whole = Math.floor(accRef.current);
        if (whole >= 1) {
          accRef.current -= whole;
          el.scrollLeft += rtl ? -whole : whole;
        }
      }
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (!rtl && el.scrollLeft >= half) el.scrollLeft -= half;
        else if (rtl && el.scrollLeft <= -half) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced, rtl, playing]);

  function nudge(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.getBoundingClientRect().width ?? 300) + 16;
    el.scrollBy({ left: (rtl ? -1 : 1) * direction * step, behavior: "smooth" });
  }

  const canAutoplay = !reduced && flashDeals.length > 0;

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {t.deals.title}
          </h2>
          <span className="flex items-center gap-2 text-sm text-muted">
            {t.deals.endsIn}
            <Countdown hours={5} minutes={43} seconds={26} />
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canAutoplay && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={!playing}
              aria-label={playing ? t.deals.pause : t.deals.play}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {playing ? (
                <PauseIcon className="h-[18px] w-[18px]" />
              ) : (
                <PlayIcon className="h-[18px] w-[18px]" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label={t.deals.prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeftIcon className="h-5 w-5 rtl:-scale-x-100" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label={t.deals.next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRightIcon className="h-5 w-5 rtl:-scale-x-100" />
          </button>
          <Link
            href="/search?category=deals"
            className="ms-1 inline-flex items-center gap-1 text-sm font-semibold text-warn transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-gold"
          >
            {t.deals.viewAll}
            <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>

      {/* Track */}
      <div
        onMouseEnter={() => (hoverRef.current = true)}
        onMouseLeave={() => (hoverRef.current = false)}
        onFocusCapture={() => (hoverRef.current = true)}
        onBlurCapture={() => (hoverRef.current = false)}
        onPointerDown={() => (pointerRef.current = true)}
        onPointerUp={() => (pointerRef.current = false)}
        onPointerCancel={() => (pointerRef.current = false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overscroll-x-contain pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={t.deals.title}
        >
          {[...flashDeals, ...flashDeals].map((product, i) => {
            const isClone = i >= flashDeals.length;
            return (
              <div
                key={`${product.id}-${i}`}
                aria-hidden={isClone}
                inert={isClone ? true : undefined}
                className="w-[280px] shrink-0 sm:w-[300px]"
              >
                <ProductCard
                  product={product}
                  bestsellerLabel={t.deals.bestseller}
                  wishlistLabel={t.header.wishlist}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
