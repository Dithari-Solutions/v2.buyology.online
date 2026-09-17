import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { SearchResults } from "@/components/products/SearchResults";
import { getDict } from "@/lib/i18n/server";

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
  return {
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Results for "${q}" across 120,000+ future products on Buyology.`
      : "Search 120,000+ future products on Buyology.",
    // Query result pages shouldn't be indexed; the canonical /search is (via sitemap).
    robots: q ? { index: false, follow: true } : undefined,
  };
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
