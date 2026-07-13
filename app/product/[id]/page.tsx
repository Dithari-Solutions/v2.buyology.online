import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header/Header";
import { getProduct, products } from "@/lib/products";
import { site } from "@/lib/site";
import { getDict } from "@/lib/i18n/server";
import { jsonLdScript, productSchema } from "@/lib/structured-data";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { AiReviewSummary } from "@/components/product/AiReviewSummary";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductQA } from "@/components/product/ProductQA";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ChevronLeftIcon } from "@/components/icons";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return { title: "Product not found" };
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
  const product = getProduct(id);
  if (!product) notFound();

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

        <ProductDetail productId={product.id} />

        <div className="mt-14 space-y-14">
          <AiReviewSummary />
          <ProductSpecs productId={product.id} />
          <ProductReviews productId={product.id} />
          <ProductQA />
          <RelatedProducts currentId={product.id} />
        </div>
      </main>
    </>
  );
}
