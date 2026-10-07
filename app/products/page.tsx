import { Suspense } from "react";
import { fetchProducts } from "@/lib/catalogue";
import { getLocale } from "@/lib/i18n/server";
import { serverMarket } from "@/lib/market-server";
import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { ProductsView } from "@/components/products/ProductsView";

export const metadata: Metadata = {
  title: "All products",
  description:
    "Browse the full Buyology catalogue — audio, wearables, computing, gaming and smart home, with filters and sorting.",
  alternates: { canonical: "/products" },
};

type ProductsPageProps = { searchParams: Promise<{ category?: string; brand?: string }> };

/** Stream real cards before hydration; slow API reads do not block the header. */
async function InitialCatalogue({ searchParams }: ProductsPageProps) {
  const [{ category, brand }, locale, market] = await Promise.all([
    searchParams, getLocale(), serverMarket(),
  ]);
  // Filtered pages keep their existing complete-set search, avoiding an unfiltered flash.
  if (category || brand) return <ProductsView initialCategory={category} initialBrand={brand} />;
  const initialFeed = await fetchProducts(locale, { page: 0 }, market).catch(() => undefined);
  // The browser still revalidates prices and retries a failed server read.
  return <ProductsView initialCategory={category} initialBrand={brand} initialFeed={initialFeed} />;
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
