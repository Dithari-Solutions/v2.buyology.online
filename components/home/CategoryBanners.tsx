import Image from "next/image";
import Link from "next/link";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { fetchBanners } from "@/lib/banners";
import { getDict, getLocale } from "@/lib/i18n/server";

/** Three campaign panels, with category navigation kept in the header. */
export async function CategoryBanners() {
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  const banners = await fetchBanners(locale);
  if (banners.length === 0) return null;
  // Reserve up to two campaigns for the side panels; rotate the remaining campaigns.
  const heroCount = Math.max(1, banners.length - 2);
  const hero = banners.slice(0, heroCount);
  const tiles = banners.slice(heroCount);
  const hasTiles = tiles.length > 0;
  return (
    <section aria-label={t.popular.promotions} className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-3 sm:px-6 sm:pt-8">
      <div className={`grid gap-4 ${hasTiles ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : ""}`}>
        <div className="min-w-0 aspect-[4/3] min-[390px]:aspect-[16/10] sm:aspect-[2/1]">
          <FeaturedCarousel banners={hero} label={t.popular.promotions}
            sizes={hasTiles ? "(min-width: 1400px) 891px, (min-width: 1024px) calc(66.67vw - 43px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)" : undefined} />
        </div>
        {hasTiles && <div className={`grid gap-4 ${tiles.length > 1 ? "grid-cols-2 lg:grid-cols-1 lg:grid-rows-2" : "grid-cols-1"}`}>
          {tiles.map((banner, index) => {
            const headline = banner.text?.trim();
            const label = banner.buttonLabel?.trim();
            const href = banner.buttonUrl?.trim();
            const className = "group relative aspect-[4/3] min-w-0 overflow-hidden rounded-2xl border border-border bg-surface-2 sm:aspect-[2/1] lg:aspect-auto";
            const content = <>
              <Image src={banner.backgroundImageUrl!} alt={headline || `${t.popular.promotions} ${heroCount + index + 1}`} fill quality={75}
                sizes="(min-width: 1400px) 446px, (min-width: 1024px) calc(33.33vw - 21px), (min-width: 640px) calc(50vw - 32px), calc(50vw - 24px)"
                className="object-contain" />
              {(headline || (href && label)) && <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 sm:p-5">
                {headline && <h3 className="break-words text-sm font-semibold leading-tight text-white sm:text-xl">{headline}</h3>}
                {href && label && <span className="text-xs font-semibold text-white sm:text-sm">{label}</span>}
              </div>}
            </>;
            return href ? <Link key={banner.id} href={href} aria-label={headline || label || t.popular.promotions} className={`${className} transition-shadow hover:shadow-[var(--shadow-elevation)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>{content}</Link>
              : <div key={banner.id} className={className}>{content}</div>;
          })}
        </div>}
      </div>
    </section>
  );
}
