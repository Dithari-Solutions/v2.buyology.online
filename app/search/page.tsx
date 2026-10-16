import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { SearchResults } from "@/components/products/SearchResults";
import { getDict } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  assistant?: string;
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return pageMetadata("/search", {
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Search Buyology for "${q}". Compare available products, specifications and current prices.`
      : "Search available Buyology products, specifications and prices.",
    // Query result pages shouldn't be indexed; the canonical /search is (via sitemap).
    robots: { index: false, follow: true },
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, category, assistant } = await searchParams;
  const t = await getDict();

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6">
        <p className="text-sm text-muted">
          {assistant ? t.search.assistant : t.search.label}
          {category ? ` · ${category}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {q ? (
            <>
              {t.search.resultsFor}{" "}
              <bdi className="text-warn dark:text-gold">“{q}”</bdi>
            </>
          ) : (
            t.search.title
          )}
        </h1>
        <SearchResults q={q} category={category} />
      </main>
    </>
  );
}
