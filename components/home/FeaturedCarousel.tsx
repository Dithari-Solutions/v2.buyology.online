"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Banner } from "@/lib/banners";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  ArrowRightShortIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";

const AUTOPLAY_MS = 5000;

/**
 * Auto-rotating promotional carousel over the REAL banners managed in the dashboard.
 * Autoplay pauses on hover/focus/touch and is disabled under reduced-motion; dots + arrow keys
 * provide manual control.
 *
 * Two layouts, one state. From lg up the slides stack and cross-fade, driven by the arrows. Below
 * lg — where those arrows are hidden — they sit side by side in a native scroll track with
 * mandatory snapping, so a finger drags the banner and it settles on a whole slide. The track's
 * scroll position is the source of truth there: scrolling sets the index, and autoplay or a dot
 * scrolls the track rather than swapping opacity.
 *
 * Today's live banners are finished artwork with the copy baked into the image and no
 * text/button fields set, so this renders image-first: the overlay text, the CTA and the
 * darkening scrim appear ONLY when the admin actually wrote copy. A scrim over artwork
 * that already carries its own headline just muddies it, and inventing an eyebrow or a
 * "Shop now" the admin never typed would put words in their mouth.
 */
export function FeaturedCarousel({
  banners,
  label,
}: {
  banners: Banner[];
  label: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const reduced = usePrefersReducedMotion();
  const count = banners.length;
  const trackRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (next: number) => {
      const target = (next + count) % count;
      setIndex(target);
      // Only the swipe layout scrolls. From lg up the slides are stacked, nothing overflows, and
      // the index alone drives the fade.
      const el = trackRef.current;
      if (el && el.scrollWidth > el.clientWidth) {
        const rtl = getComputedStyle(el).direction === "rtl";
        el.scrollTo({
          left: (rtl ? -1 : 1) * target * el.clientWidth,
          behavior: reduced ? "auto" : "smooth",
        });
      }
    },
    [count, reduced],
  );

  // A timeout re-armed on every slide change rather than a fixed interval, so a slide somebody
  // has just swiped to gets its full five seconds before autoplay moves on.
  useEffect(() => {
    if (paused || reduced || count <= 1) return;
    const id = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [index, paused, reduced, count, go]);

  /** Swipe layout: whichever slide the track has settled nearest is the current one. */
  function onScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    // scrollLeft runs negative in RTL; the distance from the start is what counts.
    const nearest = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    setIndex(Math.min(count - 1, Math.max(0, nearest)));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    }
  }

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      // A finger on the banner holds it still; autoplay must not yank a slide out from under a swipe.
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onTouchCancel={() => setPaused(false)}
      onKeyDown={onKeyDown}
      className="group relative h-full w-full overflow-hidden rounded-2xl border border-border"
    >
      {/* overscroll-x-contain keeps a hard swipe at either end from turning into the browser's
          back/forward gesture. */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:overflow-hidden"
      >
      {banners.map((banner, i) => {
        const active = i === index;
        const headline = banner.text?.trim();
        const ctaLabel = banner.buttonLabel?.trim();
        const href = banner.buttonUrl?.trim();
        const linkWholeBanner = !!href && !ctaLabel;

        const artwork = (
          <>
            {(i === 0 || active || (heroReady && i === (index + 1) % count)) && <Image
              src={banner.backgroundImageUrl!}
              alt={headline ?? `${label} ${i + 1}`}
              fill
              preload={i === 0}
              // Only the first image is in the initial HTML. Prefetch the next slide after it
              // loads, giving autoplay five seconds to prepare without competing at first paint.
              loading={i === 0 ? undefined : "eager"}
              onLoad={i === 0 ? () => setHeroReady(true) : undefined}
              onError={i === 0 ? () => setHeroReady(true) : undefined}
              quality={75}
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover"
            />}
            {/* Scrims only exist to make OUR overlay copy legible. */}
            {headline && (
              <>
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-deep/90 via-brand-deep/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </>
            )}

            {(headline || (ctaLabel && href)) && (
              <div className="absolute inset-0 flex flex-col justify-end gap-3 p-5 pb-10 sm:p-8 lg:p-10">
                {headline && (
                  <h3 className="max-w-md break-words text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
                    {headline}
                  </h3>
                )}
                {ctaLabel && href && (
                  <Link
                    href={href}
                    className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                  >
                    {ctaLabel}
                    <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
                  </Link>
                )}
              </div>
            )}
          </>
        );

        return (
          <div
            key={banner.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={!active}
            className={`relative h-full w-full shrink-0 snap-center snap-always lg:absolute lg:inset-0 lg:transition-opacity lg:duration-700 ${
              active ? "lg:opacity-100" : "lg:pointer-events-none lg:opacity-0"
            }`}
          >
            {linkWholeBanner ? (
              <Link
                href={href}
                tabIndex={active ? 0 : -1}
                aria-label={headline ?? label}
                className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset"
              >
                {artwork}
              </Link>
            ) : (
              artwork
            )}
          </div>
        );
      })}
      </div>

      {/* Prev / next — pointer affordances, revealed on hover (keyboard uses arrow keys) */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute start-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold group-hover:opacity-100 lg:flex"
          >
            <ChevronLeftIcon className="h-5 w-5 rtl:-scale-x-100" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute end-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold group-hover:opacity-100 lg:flex"
          >
            <ChevronRightIcon className="h-5 w-5 rtl:-scale-x-100" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-3 end-4 flex items-center gap-2 lg:bottom-5 lg:start-10 lg:end-auto">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1} / ${count}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                i === index ? "w-6 bg-gold" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
