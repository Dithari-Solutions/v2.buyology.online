import { Suspense, cache } from "react";
import { fetchCategories, fetchProducts, searchCatalogue } from "@/lib/catalogue";
import { getLocale } from "@/lib/i18n/server";
import { serverMarket } from "@/lib/market-server";
import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { ProductsView } from "@/components/products/ProductsView";
import { pageMetadata } from "@/lib/seo";

type ProductsPageProps = { searchParams: Promise<{ category?: string; brand?: string }> };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const load = cache(async (category?: string, brand?: string) => {
  const [locale, market] = await Promise.all([getLocale(), serverMarket()]);
  const categories = await fetchCategories(locale, market);
  const needle = typeof category === "string" ? category.toLowerCase().trim() : "";
  const selected = categories.find(c => c.status !== "INACTIVE" && [c.id, c.slug, c.name].some(v => v?.toLowerCase() === needle));
  const brandId = typeof brand === "string" && UUID.test(brand) ? brand : undefined;
  return { locale, market, categories, selected, brandId };
});

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { category, brand } = await searchParams;
  const { selected, brandId } = await load(category, brand);
  const query = new URLSearchParams();
  if (selected) query.set("category", selected.id);
  if (brandId) query.set("brand", brandId);
  return pageMetadata(`/products${query.size ? `?${query}` : ""}`, {
    ...(selected ? { title: selected.name, description: `Browse ${selected.name} at Buyology. Compare available models, current prices and specifications before choosing your next device.` } : {}),
    ...((category && !selected) || brand ? { robots: { index: false, follow: true } } : {}),
  });
}

/** Search-filtered category cards are rendered on the server too, not just after hydration. */
async function InitialCatalogue({ searchParams }: ProductsPageProps) {
  const { category, brand } = await searchParams;
  const { locale, market, categories, selected, brandId } = await load(category, brand);
  if (selected || brandId) {
    const initialFiltered = await searchCatalogue(locale, { categoryIds: selected ? [selected.id] : [], brandIds: brandId ? [brandId] : [] }, market);
    return <ProductsView key={`${locale}:${selected?.id ?? ""}:${brandId ?? ""}`} initialCategory={selected?.id} initialBrand={brandId} initialCategories={categories} initialFiltered={initialFiltered} />;
  }
  const initialFeed = await fetchProducts(locale, { page: 0 }, market);
  return <ProductsView key={`${locale}:all`} initialCategories={categories} initialFeed={initialFeed} />;
}

function CatalogueSkeleton() {
  return <div role="status" aria-label="Loading products" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
    {Array.from({ length: 9 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-xl bg-surface-2" />)}
  </div>;
}

export default function ProductsPage(props: ProductsPageProps) {
  return <>
    <Header />
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      <Suspense fallback={<CatalogueSkeleton />}><InitialCatalogue {...props} /></Suspense>
    </main>
  </>;
}
