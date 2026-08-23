import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header/Header";
import { fetchProductDetail, fetchCategories, toProduct } from "@/lib/catalogue";
import { getLocale } from "@/lib/i18n/server";
import { serverMarket } from "@/lib/market-server";
import { site } from "@/lib/site";
import { getDict } from "@/lib/i18n/server";
import { jsonLdScript, productSchema } from "@/lib/structured-data";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductProvider } from "@/components/product/product-context";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ChevronLeftIcon } from "@/components/icons";

// Product ids are live catalogue UUIDs — rendered on demand, never enumerated at build time.
export const dynamic = "force-dynamic";

async function loadProduct(id: string) {
  const locale = await getLocale();
  const market = await serverMarket();
  try {
    const api = await fetchProductDetail(locale, id, market);
    let categoryName: string | undefined;
    try {
      categoryName = (await fetchCategories(locale, market)).find((c) => c.id === api.categoryId)?.name;
    } catch {
      /* blank breadcrumb label */
    }
    return { api, product: toProduct(api, categoryName) };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const loaded = await loadProduct(id);
  if (!loaded) return { title: "Product not found" };
  const { product } = loaded;
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      url: `${site.url}/product/${product.id}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loaded = await loadProduct(id);
  if (!loaded) notFound();
  const { product, api } = loaded;

  const t = await getDict();

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(productSchema(product)),
        }}
      />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb */}
        <nav
          aria-label={t.pdp.breadcrumb}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeftIcon className="h-4 w-4 rtl:-scale-x-100" />
            {t.pdp.home}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-warn dark:text-gold">{product.category}</span>
          <span aria-hidden="true">/</span>
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        <ProductProvider product={product} api={api}>
          <ProductDetail />

          <div className="mt-14 space-y-14">
            <ProductSpecs />
            <ProductReviews />
            <RelatedProducts currentId={product.id} />
          </div>
        </ProductProvider>
      </main>
    </>
  );
}
