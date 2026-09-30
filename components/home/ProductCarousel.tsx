"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchFlashSale, type FlashSaleItem } from "@/lib/catalogue";
import { useI18n } from "@/components/i18n/language-provider";
import { useNow } from "@/hooks/useNow";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ProductCard } from "@/components/home/ProductCard";
import { Countdown } from "@/components/home/Countdown";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "@/components/icons";

const SPEED = 0.4; // px per frame — a slow, premium drift

/**
 * Below this many rows the track cannot overflow the 1400px content column (5 × 300px), so the
 * auto-scroll would have nothing to move and the duplicated half would just show the same products
 * twice side by side. A short rail therefore stays a plain, still row — which is the normal case
 * here, since the feed only returns what is actually on sale right now.
 */
const SEAMLESS_MIN = 5;

/**
 * The flash-sale rail: products whose store discount is live and ends soon, soonest first, with a
 * countdown to the next one to expire.
 *
 * The track auto-scrolls forever (seamless because the list is duplicated and scrollLeft wraps at
 * the midpoint). It pauses on hover/focus/drag and via a persistent play/pause toggle (WCAG 2.2.2).
 * The arrows scroll a card at a time. RTL-aware; auto-scroll is disabled under reduced-motion
 * (manual scroll stays).
 *
 * Data is fetched in the BROWSER, not during the home page's server render, for two reasons: the
 * endpoint is deliberately uncached, so serving it from the page would make the whole home route
 * dynamic and re-fetch it for every visitor; and a slow or failed flash-sale request must not hold
 * up or break the rest of the page. The cost is that the rail arrives a moment after the page —
 * which is invisible, because a rail with nothing in it renders nothing at all.
 */
export function ProductCarousel() {
  const { t, dir, locale } = useI18n();
  const now = useNow();
  const reduced = usePrefersReducedMotion();
  const [items, setItems] = useState<FlashSaleItem[] | null>(null);
  const [playing, setPlaying] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false); // hover / focus
  const pointerRef = useRef(false); // active drag
  const accRef = useRef(0);
  const rtl = dir === "rtl";

  const load = useCallback(() => {
    let stale = false;
    fetchFlashSale(locale)
      .then((rows) => {
        if (!stale) setItems(rows);
      })
      .catch(() => {
        // A failed FIRST load means "no sale to show": the section stays off the page rather than
        // announcing a promotion it cannot fill. There is no error state to render here.
        //
        // A failed RE-fetch must NOT do that. The rows already in hand carry their own end instants
        // and the clock below has already dropped the ones that ended, so what is left is still
        // honestly on sale — and emptying the list would take a running sale off the page for the
        // rest of the visit, because nothing would be left to expire and ask again. `prev ?? []`
        // keeps the same array reference on a re-fetch, so React does not even re-render.
        if (!stale) setItems((prev) => prev ?? []);
      });
    return () => {
      stale = true;
    };
  }, [locale]);

  useEffect(load, [load]);

  // Rows in end order, with each end instant parsed once. The endpoint already sends
  // soonest-ending first; ordering here turns that from an assumption into a property this
  // component can slice against.
  const ordered = useMemo(
    () =>
      (items ?? [])
        .map((i) => ({ ...i, at: Date.parse(i.endsAt) }))
        .sort((a, b) => a.at - b.at),
    [items],
  );

  // Each row carries the absolute instant its own sale ends, so an ended sale leaves the rail on
  // the shared clock instead of waiting for a poll. `now === 0` is the pre-hydration clock and
  // expires nothing — nothing is rendered at that point either.
  //
  // This is deliberately a COUNT and not a filtered array: it is the only value the one-second tick
  // is allowed to feed into the render, and a number that usually does not change is what keeps
  // `live` below (and the cards built from it) identical from one tick to the next.
  const expired = now > 0 ? ordered.filter((i) => i.at <= now).length : 0;

  // The rows still on sale. Ended rows are a prefix of `ordered`, so this is a slice, and its
  // identity changes only when a row actually expires or the feed comes back — never merely
  // because a second passed.
  const live = useMemo(() => ordered.slice(expired), [ordered, expired]);

  // A countdown hit zero. Dropping the row locally is only half the answer — the server is the sole
  // authority on which prices are still discounted, and on what has just come ON sale — so re-ask
  // it, which is cheap precisely because this endpoint is not cached. Keyed on the NUMBER expired so
  // a failed re-fetch is retried when the next row expires rather than immediately in a loop; the
  // dropped rows stay off screen either way, because `live` is what renders.
  useEffect(() => {
    if (expired === 0) return;
    return load();
  }, [expired, load]);

  const seamless = live.length >= SEAMLESS_MIN;

  // The cards, built from the row set rather than rebuilt on every tick.
  //
  // This component watches the one-second clock, because that is how an ended sale leaves the rail
  // the instant its countdown reaches zero — but that means it re-renders once a second, and the
  // rail can hold 120 card elements once the duplicated half is counted. ProductCard is not
  // memoised and each one reads the wishlist, so rebuilding these every second would re-reconcile
  // all of them for nothing. Handing React the SAME element references lets it skip the subtree.
  const cards = useMemo(
    () =>
      (seamless ? [...live, ...live] : live).map((item, i) => {
        const isClone = i >= live.length;
        return (
          <div
            key={`${item.product.id}-${i}`}
            aria-hidden={isClone}
            inert={isClone ? true : undefined}
            className="w-[280px] shrink-0 sm:w-[300px]"
          >
            <ProductCard
              product={item.product}
              bestsellerLabel={t.deals.bestseller}
              refurbishedLabel={t.deals.refurbished}
              wishlistLabel={t.header.wishlist}
            />
          </div>
        );
      }),
    [live, seamless, t],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const step = () => {
      if (seamless && playing && !hoverRef.current && !pointerRef.current && !reduced) {
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
      if (seamless && half > 0) {
        if (!rtl && el.scrollLeft >= half) el.scrollLeft -= half;
        else if (rtl && el.scrollLeft <= -half) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // live.length is a dependency because the track does not exist on the render that has no rows:
    // without it the loop would start against a null ref and never restart once the feed arrived.
  }, [reduced, rtl, playing, seamless, live.length]);

  function nudge(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.getBoundingClientRect().width ?? 300) + 16;
    el.scrollBy({ left: (rtl ? -1 : 1) * direction * step, behavior: "smooth" });
  }

  // Nothing on sale, nothing loaded yet, or the request failed: render NOTHING — no heading, no
  // skeleton, no empty state. A flash-sale rail standing empty advertises a promotion that is not
  // running, which is worse than the section simply not being on the page.
  if (live.length === 0) return null;

  // One countdown for the rail, aimed at whichever live sale ends first — the next thing a shopper
  // can actually miss. `ordered` is sorted by end instant, so that is the head of `live`.
  const soonest = live[0].endsAt;

  const canAutoplay = !reduced && seamless;

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
            <Countdown key={soonest} endsAt={soonest} />
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
          {cards}
        </div>
      </div>
    </section>
  );
}
