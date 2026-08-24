import Link from "next/link";
import Image from "next/image";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { fetchBanners, HERO_BANNER_COUNT } from "@/lib/banners";
import { fetchCategories } from "@/lib/catalogue";
import { categoryHref, categoryIcon, renderableRoots } from "@/lib/category-nav";
import { serverMarket } from "@/lib/market-server";
import { ArrowRightShortIcon } from "@/components/icons";
import { getDict, getLocale } from "@/lib/i18n/server";

/**
 * Shoppable "departments" region — three columns: the live category taxonomy (left), the
 * rotating hero banners (center), and the remaining banners as stacked tiles (right).
 *
 * Everything here is real: categories come from /api/category (localized names, the
 * dashboard's chosen icon, links by category ID) and banners from /api/banner (ACTIVE,
 * WEB, ordered by sortOrder — the first {@link HERO_BANNER_COUNT} rotate in the hero, the
 * rest become side tiles). Nothing is invented: with no banners the banner columns are
 * simply omitted and the category list takes the full width, because placeholder artwork
 * on a live shop is worse than a narrower region.
 */
export async function CategoryBanners() {
  const t = await getDict();
  const locale = await getLocale();
  const market = await serverMarket();

  const [banners, categories] = await Promise.all([
    fetchBanners(locale),
    fetchCategories(locale, market).catch(() => []),
  ]);

  const roots = renderableRoots(categories);
  const hero = banners.slice(0, HERO_BANNER_COUNT);
  const tiles = banners.slice(HERO_BANNER_COUNT);
  const hasHero = hero.length > 0;
  const hasTiles = tiles.length > 0;

  // The grid tracks follow what actually exists, so a missing column never leaves a hole.
  const columns = hasHero
    ? hasTiles
      ? "lg:grid-cols-[260px_minmax(0,1fr)_300px]"
      : "lg:grid-cols-[260px_minmax(0,1fr)]"
    : "lg:grid-cols-1";

  return (
    <section
      aria-labelledby="departments-heading"
      className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10"
    >
      <h2 id="departments-heading" className="sr-only">
        {t.nav.shopByCategory}
      </h2>

      <div className={`flex flex-col gap-4 lg:grid lg:h-[480px] ${columns}`}>
        {/* Left — live departments list */}
        <nav
          aria-label={t.departments.label}
          className="order-3 flex flex-col rounded-2xl border border-border bg-surface p-4 lg:order-1 lg:h-full lg:p-5"
        >
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted">
            {t.departments.label}
          </p>
          <ul className="grid grid-cols-2 gap-0.5 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:gap-0">
            {roots.map((c) => {
              const Icon = categoryIcon(c.icon);
              return (
                <li key={c.id} className="min-w-0">
                  <Link
                    href={categoryHref(c)}
                    className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-brand-icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-brand-icon" />
                    <span className="min-w-0 truncate">{c.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/products"
            className="mt-3 inline-flex items-center gap-1 px-2 text-sm font-semibold text-gold-deep transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-gold"
          >
            {t.departments.viewAll}
            <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </nav>

        {/* Center — the hero banners */}
        {hasHero && (
          <div className="relative order-1 min-h-[16rem] sm:aspect-[21/9] sm:min-h-0 lg:order-2 lg:aspect-auto lg:h-full">
            <FeaturedCarousel banners={hero} label={t.departments.label} />
          </div>
        )}

        {/* Right — the remaining banners as stacked tiles */}
        {hasTiles && (
          <div className="order-2 grid grid-cols-2 gap-4 lg:order-3 lg:h-full lg:grid-cols-1 lg:grid-rows-2">
            {tiles.slice(0, 2).map((tile) => {
              const headline = tile.text?.trim();
              const href = tile.buttonUrl?.trim();
              const inner = (
                <>
                  <Image
                    src={tile.backgroundImageUrl!}
                    alt={headline ?? ""}
                    fill
                    quality={80}
                    sizes="(max-width: 1024px) 50vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {headline && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-deep/70 via-brand-deep/15 to-transparent rtl:bg-gradient-to-bl" />
                      <div className="absolute inset-0 flex flex-col items-start justify-end p-3 sm:p-5">
                        <h3 className="break-words text-base font-semibold text-white sm:text-lg">
                          {headline}
                        </h3>
                        {href && (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors group-hover:text-white">
                            {t.departments.shopNow}
                            <ArrowRightShortIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </>
              );
              const shell =
                "group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-elevation)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:aspect-[2/1] lg:aspect-auto";
              return href ? (
                <Link key={tile.id} href={href} className={shell}>
                  {inner}
                </Link>
              ) : (
                <div key={tile.id} className={shell}>
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
