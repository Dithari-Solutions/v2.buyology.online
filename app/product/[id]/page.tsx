import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header/Header";
import {
  fetchCategories,
  fetchProductBySlug,
  fetchProductDetail,
  isProductId,
  productHref,
  toProduct,
} from "@/lib/catalogue";
import { getLocale } from "@/lib/i18n/server";
import { serverMarket } from "@/lib/market-server";
import { site } from "@/lib/site";
import { getDict } from "@/lib/i18n/server";
import { breadcrumbSchema, jsonLdScript, productSchema } from "@/lib/structured-data";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductProvider } from "@/components/product/product-context";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ChevronLeftIcon } from "@/components/icons";

// Product ids are live catalogue UUIDs — rendered on demand, never enumerated at build time.
export const dynamic = "force-dynamic";

/**
 * Loads by slug or by id. The route param is whichever form the link used: new links carry the
 * product's name, but UUID links are already indexed and shared, so both must resolve — a URL
 * that worked yesterday must not 404 today.
 */
async function loadProduct(idOrSlug: string) {
  const locale = await getLocale();
  const market = await serverMarket();
  try {
    const api = isProductId(idOrSlug)
      ? await fetchProductDetail(locale, idOrSlug, market)
      : await fetchProductBySlug(locale, idOrSlug, market);
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
  // The catalogue photo is the strongest share/preview image this page has; the site-wide
  // opengraph-image only stands in when a product has none.
  const image = product.image?.startsWith("http") ? product.image : undefined;
  return {
    title: product.name,
    description: product.description,
    // Canonical is always the slug URL, so an id link consolidates onto the readable one
    // instead of competing with it as a duplicate.
    alternates: { canonical: productHref(product) },
    openGraph: {
      title: product.name,
      description: product.description,
      type: "website",
      url: `${site.url}${productHref(product)}`,
      ...(image ? { images: [{ url: image, alt: product.name }] } : {}),
    },
    ...(image ? { twitter: { card: "summary_large_image" as const, images: [image] } } : {}),
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
      {/* Product + the same breadcrumb trail the page renders visibly, so Google shows the
          path under the result instead of a bare URL. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(productSchema(product)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbSchema([
              { name: t.pdp.home, path: "/" },
              { name: t.shop.title, path: "/products" },
              ...(product.category
                ? [
                    {
                      name: product.category,
                      path: loaded.api.categoryId
                        ? `/products?category=${loaded.api.categoryId}`
                        : "/products",
                    },
                  ]
                : []),
              { name: product.name, path: productHref(product) },
            ]),
          ),
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
