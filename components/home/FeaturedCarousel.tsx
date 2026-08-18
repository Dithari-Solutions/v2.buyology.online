"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CarouselSlide } from "@/lib/category-banners";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  ArrowRightShortIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/icons";

const AUTOPLAY_MS = 5000;

/**
 * Auto-rotating promotional carousel — the only interactive piece of the
 * departments region. Autoplay pauses on hover/focus and is disabled under
 * reduced-motion; dots + arrow keys provide manual control.
 */
export function FeaturedCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const liveRef = useRef<HTMLParagraphElement>(null);
  const count = slides.length;

  useEffect(() => {
    if (paused || reduced || count <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % count),
      AUTOPLAY_MS,
    );
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

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      className="group relative h-full min-h-[260px] w-full overflow-hidden rounded-2xl border border-border"
    >
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${slide.headline}`}
            aria-hidden={!active}
            inert={!active}
            className={`absolute inset-0 transition-opacity duration-700 ${
              active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            {/* Scrims: brand-purple diagonal + bottom darken for legibility */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-deep/90 via-brand-deep/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end gap-3 p-6 sm:p-8 lg:p-10">
              <span className="inline-flex w-fit items-center rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-gold backdrop-blur-sm">
                {slide.eyebrow}
              </span>
              <h3 className="max-w-md text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
                {slide.headline}
              </h3>
              <p className="max-w-sm text-sm text-white/80 sm:text-base">
                {slide.subline}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
                >
                  {slide.cta.label}
                </Link>
                <Link
                  href={slide.link.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {slide.link.label}
                  <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / next (subtle; hidden on small screens) */}
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
        <div className="absolute bottom-5 end-6 flex items-center gap-2 lg:start-10 lg:end-auto">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}: ${slide.headline}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                i === index ? "w-6 bg-gold" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      <p ref={liveRef} className="sr-only" aria-live="polite">
        {`Slide ${index + 1} of ${count}: ${slides[index]?.headline}`}
      </p>
    </section>
  );
}
