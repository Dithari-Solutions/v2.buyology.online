import Link from "next/link";
import Image from "next/image";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { carouselSlides, promoTiles } from "@/lib/category-banners";
import { productCategories } from "@/lib/nav-data";
import { ArrowRightShortIcon } from "@/components/icons";
import { getDict } from "@/lib/i18n/server";

/**
 * Shoppable "departments" region — a three-column layout: a departments list
 * (left), the large auto-rotating featured carousel (center, the only client
 * piece), and two stacked promo tiles (right). Server component: slides/tiles
 * are localized here, then the carousel receives ready-to-render props.
 */
export async function CategoryBanners() {
  const t = await getDict();

  const slides = carouselSlides.map((s) => {
    const tr = t.slides[s.id];
    return {
      ...s,
      eyebrow: tr.eyebrow,
      headline: tr.headline,
      subline: tr.subline,
      cta: { ...s.cta, label: tr.cta },
      link: { ...s.link, label: tr.link },
    };
  });

  return (
    <section
      aria-labelledby="departments-heading"
      className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10"
    >
      <h2 id="departments-heading" className="sr-only">
        {t.nav.shopByCategory}
      </h2>

      <div className="flex flex-col gap-4 lg:grid lg:h-[480px] lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        {/* Left — Departments list */}
        <nav
          aria-label={t.departments.label}
          className="order-3 flex flex-col rounded-2xl border border-border bg-surface p-4 lg:order-1 lg:h-full lg:p-5"
        >
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted">
            {t.departments.label}
          </p>
          <ul className="grid grid-cols-2 gap-0.5 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:gap-0">
            {productCategories.map((c) => {
              const Icon = c.icon;
              return (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-2 hover:text-brand-icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 text-brand-icon" />
                    <span className="truncate">{t.items[c.key].label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/search"
            className="mt-3 inline-flex items-center gap-1 px-2 text-sm font-semibold text-gold-deep transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-gold"
          >
            {t.departments.viewAll}
            <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </nav>

        {/* Center — Featured carousel */}
        <div className="relative order-1 aspect-[16/10] sm:aspect-[21/9] lg:order-2 lg:aspect-auto lg:h-full">
          <FeaturedCarousel slides={slides} />
        </div>

        {/* Right — two stacked promo tiles */}
        <div className="order-2 grid grid-cols-2 gap-4 lg:order-3 lg:h-full lg:grid-cols-1 lg:grid-rows-2">
          {promoTiles.map((tile) => {
            const tr = t.promos[tile.id];
            return (
              <Link
                key={tile.id}
                href={tile.href}
                className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-elevation)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:aspect-[2/1] lg:aspect-auto"
              >
                <Image
                  src={tile.image}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-deep/70 via-brand-deep/15 to-transparent rtl:bg-gradient-to-bl" />
                <div className="absolute inset-0 flex flex-col items-start p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                    {tr.eyebrow}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {tr.title}
                  </h3>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors group-hover:text-white">
                    {t.departments.shopNow}
                    <ArrowRightShortIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
