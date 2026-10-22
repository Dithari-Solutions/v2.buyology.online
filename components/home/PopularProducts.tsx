"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchPopularProducts } from "@/lib/catalogue";
import type { Product } from "@/lib/products";
import { useI18n } from "@/components/i18n/language-provider";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { ProductCard } from "@/components/home/ProductCard";
import { ArrowRightShortIcon, ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from "@/components/icons";

/** Changing language starts a fresh feed instead of mixing old names with translated controls. */
export function PopularProducts() {
  const { locale } = useI18n();
  return <PopularProductsRail key={locale} />;
}

function PopularProductsRail() {
  const { locale, dir, t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [playing, setPlaying] = useState(true);
  const [cycle, setCycle] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const reduced = usePrefersReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const focused = useRef(false);
  const held = useRef(false);
  const resumeAt = useRef(0);
  const rtl = dir === "rtl";
  const sign = rtl ? -1 : 1;

  useEffect(() => {
    let stale = false;
    fetchPopularProducts(locale).then((items) => { if (!stale) setProducts(items); }).catch(() => {});
    return () => { stale = true; };
  }, [locale]);

  // A short selection stays a single row, without repeating the same products side by side.
  // Measure real widths so zoom, tablet layouts and translated cards retain the correct seam.
  useEffect(() => {
    const el = track.current;
    const original = group.current;
    if (!el || !original) return;
    const observer = new ResizeObserver(() => {
      const width = original.getBoundingClientRect().width + 16;
      setCycle(products.length > 1 && width > el.clientWidth + 1 ? width : 0);
    });
    observer.observe(el);
    observer.observe(original);
    return () => observer.disconnect();
  }, [products.length]);

  useEffect(() => {
    if (track.current) track.current.scrollLeft = sign * cycle;
  }, [cycle, sign]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [products.length]);

  useEffect(() => {
    const release = () => {
      if (!held.current) return;
      held.current = false;
      resumeAt.current = performance.now() + 2000;
    };
    const visibility = () => setPageVisible(!document.hidden);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el || !cycle || !playing || reduced || !visible || !pageVisible) return;
    let frame = 0;
    let last = 0;
    let remainder = 0;
    const tick = (time: number) => {
      const elapsed = last ? Math.min(time - last, 64) : 0;
      last = time;
      if (!hovered.current && !focused.current && !held.current && time >= resumeAt.current) {
        remainder += elapsed * 0.025; // 25 pixels / second, independent of refresh rate.
        const pixels = Math.floor(remainder);
        remainder -= pixels;
        el.scrollLeft += sign * pixels;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [cycle, playing, reduced, visible, pageVisible, sign]);

  function wrap() {
    const el = track.current;
    if (!el || !cycle || held.current) return;
    const position = sign * el.scrollLeft;
    if (position >= cycle * 2) el.scrollLeft -= sign * cycle;
    else if (position < cycle / 2) el.scrollLeft += sign * cycle;
  }

  function nudge(direction: number) {
    const el = track.current;
    if (!el) return;
    const card = group.current?.firstElementChild as HTMLElement | null;
    resumeAt.current = performance.now() + 1500;
    el.scrollBy({ left: sign * direction * ((card?.getBoundingClientRect().width ?? 280) + 16), behavior: reduced ? "auto" : "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section aria-labelledby="popular-products-heading" aria-roledescription="carousel" className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 sm:py-9">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id="popular-products-heading" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t.popular.title}</h2>
          <p className="mt-2 text-sm text-muted sm:text-base">{t.popular.description}</p>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <Link href="/products" className="me-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-icon hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t.popular.viewAll}<ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" /></Link>
          {!!cycle && !reduced && <button type="button" aria-label={playing ? t.deals.pause : t.deals.play} aria-pressed={!playing} onClick={() => setPlaying((value) => !value)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </button>}
          <button type="button" disabled={!cycle} aria-label={t.deals.prev} onClick={() => nudge(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"><ChevronLeftIcon className="h-5 w-5 rtl:-scale-x-100" /></button>
          <button type="button" disabled={!cycle} aria-label={t.deals.next} onClick={() => nudge(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"><ChevronRightIcon className="h-5 w-5 rtl:-scale-x-100" /></button>
        </div>
      </div>
      <div ref={track} role="group" aria-label={t.popular.title} tabIndex={0} onScroll={wrap}
        onMouseEnter={() => { hovered.current = true; }} onMouseLeave={() => { hovered.current = false; }}
        onFocusCapture={() => { focused.current = true; }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focused.current = false; }}
        onPointerDown={() => { held.current = true; }} onWheel={() => { resumeAt.current = performance.now() + 2000; }}
        onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "ArrowRight" || event.key === "ArrowLeft")) { event.preventDefault(); nudge(event.key === "ArrowRight" ? sign : -sign); } }}
        className="flex gap-4 overflow-x-auto overscroll-x-contain py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {(cycle ? [0, 1, 2] : [1]).map((copy) => <div key={copy} ref={copy === 1 ? group : undefined} aria-hidden={copy !== 1 ? true : undefined} data-loop-copy={copy !== 1 ? "true" : undefined} className="flex w-max shrink-0 gap-4">
          {products.map((product) => <div key={product.id} className="w-[min(78vw,280px)] shrink-0 sm:w-[280px]">
            <ProductCard product={product} duplicate={copy !== 1} bestsellerLabel={t.popular.featured} refurbishedLabel={t.deals.refurbished} wishlistLabel={t.header.wishlist} />
          </div>)}
        </div>)}
      </div>
    </section>
  );
}
