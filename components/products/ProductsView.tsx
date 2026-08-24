"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/language-provider";
import type { Product } from "@/lib/products";
import {
  fetchCategories,
  fetchProducts,
  searchCatalogue,
  type Category,
} from "@/lib/catalogue";
import { formatMoney } from "@/lib/format";
import { lockBodyScroll } from "@/lib/scroll-lock";
import {
  activeFilterCount,
  applyClientFilters,
  DEFAULT_FILTERS,
  needsServerSearch,
  SORT_KEYS,
  sortProducts,
  type Filters,
  type SortKey,
} from "@/lib/shop";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductCard } from "@/components/home/ProductCard";
import { BagIcon, CloseIcon, LifeBuoyIcon, SettingsIcon } from "@/components/icons";

const PAGE = 9;

export function ProductsView({ initialCategory }: { initialCategory?: string }) {
  const { t, locale } = useI18n();

  // ── Browse mode: the plain catalogue, accumulated page by page ─────────────
  const [catalog, setCatalog] = useState<Product[] | null>(null);
  const [serverPage, setServerPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [browseError, setBrowseError] = useState(false);
  // A fetch failure must not masquerade as an empty catalogue, and stale responses (locale
  // switched, or retried) must not land: every browse fetch carries a generation and only the
  // current one may write state.
  const catalogGen = useRef(0);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    const gen = ++catalogGen.current;
    fetchProducts(locale, { page: 0 })
      .then(({ items, hasMore: more }) => {
        if (gen !== catalogGen.current) return;
        setCatalog(items);
        setServerPage(0);
        setHasMore(more);
        setBrowseError(false);
      })
      .catch(() => {
        if (gen === catalogGen.current) setBrowseError(true);
      });
  }, [locale, retryNonce]);

  async function loadNextServerPage() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const gen = catalogGen.current;
    try {
      const next = serverPage + 1;
      const { items, hasMore: more } = await fetchProducts(locale, { page: next });
      if (gen !== catalogGen.current) return; // a locale switch replaced the catalogue meanwhile
      setCatalog((prev) => [...(prev ?? []), ...items]);
      setServerPage(next);
      setHasMore(more);
    } catch {
      /* keep what we have */
    } finally {
      setLoadingMore(false);
    }
  }

  // ── The real category list — ids drive /api/product/search, names label chips ──
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchCategories(locale)
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {
        /* sidebar just shows no category section content */
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);
  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "";

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("featured");
  const [visible, setVisible] = useState(PAGE);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // /products?category= — new links carry the category ID (locale-invariant); older links and
  // shared URLs may carry a name or slug, which are BOTH localized per language, so those are
  // resolved against the active-locale AND the English lists. Resolution happens exactly once:
  // whatever the outcome, the user owns the chip afterwards (a locale switch must not re-add a
  // filter they removed).
  const appliedInitial = useRef(false);
  useEffect(() => {
    if (appliedInitial.current || !initialCategory) return;
    let stale = false;
    const apply = (id: string | null) => {
      if (stale || appliedInitial.current) return;
      appliedInitial.current = true;
      if (!id) return;
      setFilters((f) =>
        f.categories.includes(id) ? f : { ...f, categories: [...f.categories, id] },
      );
      setVisible(PAGE);
    };
    const wanted = initialCategory.trim().toLowerCase();
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(wanted)) {
      apply(wanted);
      return;
    }
    Promise.all([
      fetchCategories(locale).catch(() => [] as Category[]),
      fetchCategories("en").catch(() => [] as Category[]),
    ]).then(([localized, english]) => {
      const pool = [...localized, ...english];
      const match =
        pool.find(
          (c) => c.slug?.toLowerCase() === wanted || c.name.toLowerCase() === wanted,
        ) ??
        // "Computing" should still land on "Computing Accessories".
        pool.find(
          (c) =>
            c.slug?.toLowerCase().startsWith(wanted) ||
            c.name.toLowerCase().startsWith(wanted),
        );
      apply(match?.id ?? null);
    });
    return () => {
      stale = true;
    };
  }, [initialCategory, locale]);

  // ── Filtered mode: any active filter or non-default sort needs the COMPLETE matched set,
  // which only /api/product/search returns — client predicates over partially-loaded browse
  // pages would drop matches that live on pages never fetched. ─────────────────────────────
  const serverKey = useMemo(
    () =>
      needsServerSearch(filters, sort)
        ? JSON.stringify({
            c: [...filters.categories].sort(),
            lo: filters.priceMin,
            hi: filters.priceMax,
            sd: filters.bestseller,
          })
        : null,
    [filters, sort],
  );
  const [results, setResults] = useState<Product[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  useEffect(() => {
    if (serverKey === null) {
      setResults(null);
      setSearching(false);
      setSearchError(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    // Debounce: slider drags re-run this effect per step; the cleanup cancels the previous
    // timer so only the resting value hits the network.
    const timer = setTimeout(() => {
      const q = JSON.parse(serverKey) as {
        c: string[];
        lo: number | null;
        hi: number | null;
        sd: boolean;
      };
      searchCatalogue(locale, {
        categoryIds: q.c,
        minPrice: q.lo ?? undefined,
        maxPrice: q.hi ?? undefined,
        superDealsOnly: q.sd,
      })
        .then((items) => {
          if (cancelled) return;
          setResults(items);
          setSearchError(false);
        })
        .catch(() => {
          // Keep whatever was on screen; the error card owns the grid until a retry succeeds.
          if (!cancelled) setSearchError(true);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [serverKey, locale, retryNonce]);

  // Slider scale: grows to the priciest product seen and never shrinks mid-session, so the
  // thumbs don't jump under the user's pointer when new pages load.
  const [priceCeil, setPriceCeil] = useState(500);
  useEffect(() => {
    let maxSeen = 0;
    for (const p of catalog ?? []) maxSeen = Math.max(maxSeen, p.price);
    for (const p of results ?? []) maxSeen = Math.max(maxSeen, p.price);
    if (maxSeen > 0)
      setPriceCeil((prev) => Math.max(prev, Math.ceil(maxSeen / 100) * 100));
  }, [catalog, results]);

  const filtered = useMemo(() => {
    const base =
      serverKey !== null
        ? applyClientFilters(results ?? [], filters)
        : (catalog ?? []);
    return sortProducts(base, sort);
  }, [serverKey, results, catalog, filters, sort]);
  const shown = filtered.slice(0, visible);
  const activeCount = activeFilterCount(filters);
  const loadError = serverKey !== null ? searchError : browseError;
  const initialLoading =
    serverKey !== null ? results === null : catalog === null;

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
  filters.categories.forEach((id) =>
    chips.push({
      key: `c-${id}`,
      label: categoryName(id) || "…",
      remove: () =>
        update({
          ...filters,
          categories: filters.categories.filter((x) => x !== id),
        }),
    }),
  );
  if (filters.priceMin != null || filters.priceMax != null)
    chips.push({
      key: "price",
      label: `${formatMoney(filters.priceMin ?? 0, "AED")} – ${
        filters.priceMax != null
          ? formatMoney(filters.priceMax, "AED")
          : `${formatMoney(priceCeil, "AED")}+`
      }`,
      remove: () => update({ ...filters, priceMin: null, priceMax: null }),
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

  const filterPanel = (
    <ProductFilters
      categories={categories}
      priceCeil={priceCeil}
      filters={filters}
      onChange={update}
    />
  );

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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 text-sm text-muted">
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
              className="max-w-[11rem] truncate rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
              <bdi>{chip.label}</bdi>
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
          {filterPanel}
        </aside>

        {/* Grid */}
        <div>
          {loadError && !searching ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-muted">
                <LifeBuoyIcon className="h-7 w-7" />
              </span>
              <p className="text-lg font-semibold text-foreground">
                {t.shop.loadFailed}
              </p>
              <button
                type="button"
                onClick={() => setRetryNonce((n) => n + 1)}
                className="mt-1 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t.shop.retry}
              </button>
            </div>
          ) : initialLoading || (searching && shown.length === 0) ? (
            <div
              className="grid grid-cols-2 gap-4 sm:grid-cols-3"
              aria-busy
            >
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-border bg-surface motion-reduce:animate-none"
                />
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
              <div
                className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 ${
                  searching ? "pointer-events-none opacity-50" : ""
                }`}
                aria-busy={searching || undefined}
              >
                {shown.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    bestsellerLabel={t.deals.bestseller}
                    wishlistLabel={t.header.wishlist}
                  />
                ))}
              </div>
              {(visible < filtered.length || (serverKey === null && hasMore)) && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setVisible((v) => v + PAGE);
                      // Browse mode nears the end of what is loaded → pull the next server
                      // page. Filtered mode already holds the complete matched set.
                      if (
                        serverKey === null &&
                        visible + PAGE >= (catalog?.length ?? 0)
                      )
                        void loadNextServerPage();
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
              <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
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
