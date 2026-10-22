import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { fetchBanners } from "@/lib/banners";
import { getDict, getLocale } from "@/lib/i18n/server";

/** Full-width campaign artwork; category navigation lives in the header. */
export async function CategoryBanners() {
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  const banners = await fetchBanners(locale);
  if (banners.length === 0) return null;
  return (
    <section aria-label={t.popular.promotions} className="mx-auto w-full max-w-[1400px] px-4 pt-6 pb-3 sm:px-6 sm:pt-8">
      <div className="aspect-[4/3] min-[390px]:aspect-[16/10] sm:aspect-[2/1]">
        <FeaturedCarousel banners={banners} label={t.popular.promotions} />
      </div>
    </section>
  );
}
