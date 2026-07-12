import type { Metadata } from "next";
import { Header } from "@/components/header/Header";

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

// Deterministic mock results so the demo is coherent without a backend.
const MOCK = [
  "Aurora Field Earbuds",
  "Helix Fold Console",
  "Nimbus 16 Laptop",
  "Pulse Ring Wearable",
  "Orbit Home Hub",
  "Vantage OLED Monitor",
];

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
        <p className="mt-2 text-sm text-muted">
          Mock results — this is a UI-only demo. Try the microphone in the
          header to search by voice.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {MOCK.map((name, i) => (
            <li
              key={name}
              className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevation)]"
            >
              <div
                className="aspect-[4/3] bg-gradient-to-br from-brand to-brand-deep"
                aria-hidden="true"
              />
              <div className="p-4">
                <h2 className="text-sm font-semibold text-foreground">{name}</h2>
                <p className="mt-1.5 text-sm font-semibold text-warn dark:text-gold">
                  ${(199 + i * 130).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
