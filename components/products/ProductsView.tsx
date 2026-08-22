"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/language-provider";
import type { Product } from "@/lib/products";
import { fetchProducts } from "@/lib/catalogue";
import { lockBodyScroll } from "@/lib/scroll-lock";
import {
  activeFilterCount,
  applyFilters,
  DEFAULT_FILTERS,
  SORT_KEYS,
  sortProducts,
  type Filters,
  type SortKey,
} from "@/lib/shop";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductCard } from "@/components/home/ProductCard";
import {
  BagIcon,
  CloseIcon,
  SettingsIcon,
} from "@/components/icons";

const PAGE = 9;

export function ProductsView({ initialCategory }: { initialCategory?: string }) {
  const { t, locale } = useI18n();
  // The real catalogue, accumulated page by page. Filtering and sorting stay client-side over
  // what is loaded — the same UX as before, now over real items; server-side facet search
  // (/api/product/search) is a later upgrade if the catalogue outgrows this.
  const [catalog, setCatalog] = useState<Product[] | null>(null);
  const [serverPage, setServerPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchProducts(locale, { page: 0 })
      .then(({ items, hasMore: more }) => {
        if (cancelled) return;
        setCatalog(items);
        setServerPage(0);
        setHasMore(more);
      })
      .catch(() => {
        if (!cancelled) setCatalog([]); // fail soft: an empty grid with the standard empty state
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  async function loadNextServerPage() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = serverPage + 1;
      const { items, hasMore: more } = await fetchProducts(locale, { page: next });
      setCatalog((prev) => [...(prev ?? []), ...items]);
      setServerPage(next);
      setHasMore(more);
    } catch {
      /* keep what we have */
    } finally {
      setLoadingMore(false);
    }
  }

  const categories = useMemo(
    () => [...new Set((catalog ?? []).map((p) => p.category).filter(Boolean))],
    [catalog],
  );

  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    categories: initialCategory ? [initialCategory] : [],
  }));
  const [sort, setSort] = useState<SortKey>("featured");
  const [visible, setVisible] = useState(PAGE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(
    () => sortProducts(applyFilters(catalog ?? [], filters), sort),
    [catalog, filters, sort],
  );
  const shown = filtered.slice(0, visible);
  const activeCount = activeFilterCount(filters);

  useEffect(() => {
    if (!drawerOpen) return;
    const release = lockBodyScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      release();
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  function update(next: Filters) {
    setFilters(next);
    setVisible(PAGE);
  }
  function clearAll() {
    update(DEFAULT_FILTERS);
  }

  // Active filter chips
  const chips: { key: string; label: string; remove: () => void }[] = [];
  filters.categories.forEach((c) =>
    chips.push({
      key: `c-${c}`,
      label: c,
      remove: () =>
        update({
          ...filters,
          categories: filters.categories.filter((x) => x !== c),
        }),
    }),
  );
  if (filters.price !== "any")
    chips.push({
      key: "price",
      label: t.shop.brackets[filters.price as keyof typeof t.shop.brackets],
      remove: () => update({ ...filters, price: "any" }),
    });
  if (filters.rating > 0)
    chips.push({
      key: "rating",
      label: `${filters.rating}★ ${t.shop.ratingUp}`,
      remove: () => update({ ...filters, rating: 0 }),
    });
  if (filters.onSale)
    chips.push({
      key: "sale",
      label: t.shop.onSale,
      remove: () => update({ ...filters, onSale: false }),
    });
  if (filters.bestseller)
    chips.push({
      key: "best",
      label: t.shop.bestsellers,
      remove: () => update({ ...filters, bestseller: false }),
    });

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t.shop.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.shop.subtitle}</p>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          {t.shop.results}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <SettingsIcon className="h-4 w-4" />
            {t.shop.filters}
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">{t.shop.sortBy}</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setVisible(PAGE);
              }}
              aria-label={t.shop.sortBy}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SORT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {t.shop.sort[k]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Active chips */}
      {activeCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand-icon transition-colors hover:bg-primary hover:text-primary-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {chip.label}
              <CloseIcon className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            {t.shop.clearAll}
          </button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden lg:sticky lg:top-40 lg:block lg:self-start">
          <ProductFilters
            categories={categories}
            filters={filters}
            onChange={update}
          />
        </aside>

        {/* Grid */}
        <div>
          {catalog === null ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
                <BagIcon className="h-7 w-7" />
              </span>
              <p className="text-lg font-semibold text-foreground">
                {t.shop.empty}
              </p>
              <p className="text-sm text-muted">{t.shop.emptyHint}</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t.shop.clearAll}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {shown.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    bestsellerLabel={t.deals.bestseller}
                    wishlistLabel={t.header.wishlist}
                  />
                ))}
              </div>
              {(visible < filtered.length || hasMore) && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setVisible((v) => v + PAGE);
                      // Nearing the end of what is loaded → pull the next server page as well.
                      if (visible + PAGE >= (catalog?.length ?? 0)) void loadNextServerPage();
                    }}
                    className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {t.shop.loadMore}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[110] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t.shop.filters}
          >
            <div
              className="buyo-overlay absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col bg-background shadow-2xl">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h2 className="font-semibold text-foreground">{t.shop.filters}</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label={t.cart.close}
                  className="rounded-md p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  onChange={update}
                />
              </div>
              <div className="flex gap-2 border-t border-border p-4">
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t.shop.clearAll}
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t.shop.showResults} ({filtered.length})
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
