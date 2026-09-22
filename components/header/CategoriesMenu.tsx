"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { fetchCategoryBrands, type Category, type CategoryBrand } from "@/lib/catalogue";
import { categoryHref, categoryIcon } from "@/lib/live-categories";
import { brandMark } from "@/lib/brand-logos";
import { useI18n } from "@/components/i18n/language-provider";
import { ArrowRightShortIcon } from "@/components/icons";

/**
 * The categories mega-menu: department list on the left, the brands that department carries on
 * the right.
 *
 * <p>Pointing at a category swaps the right side, which is the whole point of the layout — the
 * brand a shopper is loyal to ("do they even have ThinkPads?") is the question the old grid of
 * category tiles could not answer without three clicks.
 *
 * <p>Brands render as marks where we hold one and as wordmarks otherwise, so a brand the icon set
 * has never heard of (WiWU, Getac) still reads as a brand rather than leaving a hole in the row.
 *
 * <p>The department list is a roving-tabindex list: only the active department is in the tab order,
 * and Up/Down move between them. Without that, Tab would walk all eight departments before reaching
 * the brand tiles — and by the time it arrived the panel would be showing the LAST department's
 * brands, leaving every other department's tiles unreachable by keyboard.
 */
export function CategoriesMenu({
  categories,
  onNavigate,
}: {
  categories: Category[] | null;
  onNavigate: () => void;
}) {
  const { t, locale } = useI18n();
  const [brandsByCategory, setBrandsByCategory] = useState<Map<string, CategoryBrand[]> | null>(
    null,
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let stale = false;
    fetchCategoryBrands(locale).then((map) => {
      if (!stale) setBrandsByCategory(map);
    });
    return () => {
      stale = true;
    };
  }, [locale]);

  // The first department leads until the shopper points at another, so the right side is never
  // an empty box waiting for a hover.
  const active = useMemo(
    () => categories?.find((c) => c.id === activeId) ?? categories?.[0] ?? null,
    [categories, activeId],
  );
  // The brands come from a catalogue read of their own, which is warm in a fifth of a second and
  // slow when the backend's cache is cold — so the tiles have a waiting state rather than a panel
  // that looks like a category with no brands in it.
  const brands = active && brandsByCategory ? (brandsByCategory.get(active.id) ?? []) : [];

  const move = useCallback(
    (delta: number) => {
      if (!categories?.length || !active) return;
      const from = categories.findIndex((c) => c.id === active.id);
      const to = Math.min(categories.length - 1, Math.max(0, from + delta));
      if (to === from) return;
      setActiveId(categories[to].id);
      // Focus follows the selection, which is what makes Tab land on THIS department's brands.
      listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-department]")[to]?.focus();
    },
    [categories, active],
  );

  function onListKeyDown(e: React.KeyboardEvent) {
    const step =
      e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : e.key === "Home" ? -Infinity : e.key === "End" ? Infinity : 0;
    if (!step) return;
    e.preventDefault();
    move(step);
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-x-8 gap-y-5 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:grid-rows-[auto_auto] lg:py-10">
      {/* Left — the departments, in the type size Apple gives them: the list IS the navigation. */}
      <div className="lg:col-start-1 lg:row-start-1">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
          {t.nav.shopByCategory}
        </p>
        {categories === null ? (
          <ul className="space-y-3" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="h-7 w-48 animate-pulse rounded-lg bg-surface-2 motion-reduce:animate-none" />
            ))}
          </ul>
        ) : (
          <ul ref={listRef} className="space-y-0.5" onKeyDown={onListKeyDown}>
            {categories.map((c) => {
              const Icon = categoryIcon(c.icon);
              const isActive = active?.id === c.id;
              return (
                <li key={c.id}>
                  <Link
                    href={categoryHref(c)}
                    data-department
                    tabIndex={isActive ? 0 : -1}
                    onClick={onNavigate}
                    onMouseEnter={() => setActiveId(c.id)}
                    onFocus={() => setActiveId(c.id)}
                    className={`group flex items-center gap-3 rounded-xl px-2 py-1.5 text-xl font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-2xl ${
                      isActive ? "text-foreground" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-opacity ${
                        isActive ? "text-brand-icon opacity-100" : "opacity-0 group-hover:opacity-60"
                      }`}
                    />
                    <span className="min-w-0 truncate">{c.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

      </div>

      {/* Right — the brands in the department being pointed at. */}
      <div className="rounded-2xl bg-surface-2/60 p-5 sm:p-6 lg:col-start-2 lg:row-start-1 lg:row-span-2">
        {active && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              {t.nav.brands}
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">{active.name}</p>

            {brandsByCategory === null && (
              <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <li
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-surface motion-reduce:animate-none"
                  />
                ))}
              </ul>
            )}

            {brandsByCategory !== null && brands.length === 0 && (
              // Two of the live departments carry no branded stock at all. Saying so is better than
              // the blank rectangle that otherwise sits here looking like a fetch that failed.
              <p className="mt-4 max-w-sm text-sm text-muted">{t.nav.noBrands}</p>
            )}

            {brands.length > 0 && (
              <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {brands.map((brand) => {
                  const mark = brandMark(brand.name);
                  return (
                    <li key={brand.id}>
                      <Link
                        // Into the catalogue filtered by BOTH, because the tile means "this brand,
                        // in this department". Free-text search would drop the department and match
                        // titles rather than brands.
                        href={`/products?category=${active.id}&brand=${brand.id}`}
                        onClick={onNavigate}
                        className="flex h-20 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-center transition-colors hover:border-brand-200 hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {mark && (
                          // Decorative: the name below is already the link's accessible name, and a
                          // labelled <svg> here would have a screen reader say "Apple Apple".
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-7 w-7 text-foreground"
                            fill="currentColor"
                          >
                            <path d={mark.path} />
                          </svg>
                        )}
                        <span
                          className={
                            mark
                              ? "text-xs text-muted"
                              : "text-base font-semibold tracking-tight text-foreground"
                          }
                        >
                          {brand.name}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <Link
              href={categoryHref(active)}
              onClick={onNavigate}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t.departments.shopNow}
              <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </>
        )}
      </div>

      {/* Sits under the department list, but after the brands in the DOM — see the grid note above. */}
      <Link
        href="/products"
        onClick={onNavigate}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-icon transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:col-start-1 lg:row-start-2"
      >
        {t.shop.title}
        <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
      </Link>
    </div>
  );
}
