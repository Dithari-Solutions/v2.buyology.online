import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { SearchResults } from "@/components/products/SearchResults";

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

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6">
        <p className="text-sm text-muted">
          {assistant ? "AI Assistant" : "Search"}
          {category ? ` · ${category}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {q ? (
            <>
              Results for{" "}
              <span className="text-warn dark:text-gold">“{q}”</span>
            </>
          ) : (
            "Search Buyology"
          )}
        </h1>
        <SearchResults q={q} category={category} />
      </main>
    </>
  );
}
