"use client";

import { useEffect, useState } from "react";
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
 * Autoplay pauses on hover/focus and is disabled under reduced-motion; dots + arrow keys
 * provide manual control.
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
  const reduced = usePrefersReducedMotion();
  const count = banners.length;

  useEffect(() => {
    if (paused || reduced || count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, reduced, count]);

  const go = (next: number) => setIndex((next + count) % count);

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
      onKeyDown={onKeyDown}
      className="group relative h-full w-full overflow-hidden rounded-2xl border border-border"
    >
      {banners.map((banner, i) => {
        const active = i === index;
        const headline = banner.text?.trim();
        const ctaLabel = banner.buttonLabel?.trim();
        const href = banner.buttonUrl?.trim();
        const linkWholeBanner = !!href && !ctaLabel;

        const artwork = (
          <>
            <Image
              src={banner.backgroundImageUrl!}
              alt={headline ?? ""}
              fill
              priority={i === 0}
              quality={90}
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover"
            />
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
            className={`absolute inset-0 transition-opacity duration-700 ${
              active ? "opacity-100" : "pointer-events-none opacity-0"
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
