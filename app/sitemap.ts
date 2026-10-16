import type { MetadataRoute } from "next";
import { serverMarket } from "@/lib/market-server";
import { SEO_PAGES } from "@/lib/seo";
import { fetchCategories, productHref, type ApiProduct } from "@/lib/catalogue";
import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import { fetchAnnouncements } from "@/lib/news-api";

const PAGE_SIZE = 24;
const MAX_URLS = 45_000;

/** Only indexable canonical URLs. Product enumeration stops at the actual end, not eight pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const market = await serverMarket();
  const origin = `https://${market.host}`;
  const routes: MetadataRoute.Sitemap = Object.keys(SEO_PAGES).map(path => ({
    url: `${origin}${path === "/" ? "" : path}`, changeFrequency: path === "/" || path === "/products" ? "daily" : "monthly",
  }));
  const productCategories = new Set<string>();
  const seen = new Set<string>();
  try {
    for (let page = 0; routes.length < MAX_URLS; page++) {
      const params = new URLSearchParams({ lang: "EN", countryCode: market.countryCode, currency: market.currency, page: String(page), size: String(PAGE_SIZE) });
      // Cached only for discovery; these responses are never used as a checkout price source.
      const response = await fetch(backendUrl(`/api/product?${params}`), { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error(`Catalogue sitemap ${response.status}`);
      const envelope = await response.json() as ApiEnvelope<ApiProduct[]>;
      if (!Array.isArray(envelope.data)) throw new Error("Invalid catalogue sitemap response");
      const rows = envelope.data;
      let added = 0;
      for (const product of rows) {
        if (!product.id || seen.has(product.id)) continue;
        seen.add(product.id); added++;
        if (product.availableInSelectedCountry === false) continue;
        if (product.categoryId) productCategories.add(product.categoryId);
        routes.push({ url: `${origin}${productHref({ id: product.id, slug: product.slug ?? undefined })}`, changeFrequency: "weekly" });
      }
      if (rows.length < PAGE_SIZE || added === 0) break;
    }
  } catch (error) {
    console.warn("Sitemap catalogue temporarily incomplete:", error instanceof Error ? error.message : "Unavailable");
  }
  try {
    const categories = await fetchCategories("en", market);
    // The public category search matches exact IDs; only advertise categories with actual products.
    const populated = new Set(productCategories);
    for (const category of categories) if (category.status !== "INACTIVE" && populated.has(category.id)) {
      routes.push({ url: `${origin}/products?category=${encodeURIComponent(category.id)}`, changeFrequency: "weekly" });
    }
  } catch { /* Static content and available product URLs remain useful. */ }
  for (const article of await fetchAnnouncements() ?? []) {
    if (article.status !== "PUBLISHED" || !article.slug) continue;
    const modified = article.publishedAt && Number.isFinite(Date.parse(article.publishedAt)) ? article.publishedAt : undefined;
    routes.push({ url: `${origin}/news/${encodeURIComponent(article.slug)}`, ...(modified ? { lastModified: modified } : {}) });
  }
  // No invented "last modified now" timestamps, search results, accounts, tracking or coming-soon pages.
  return [...new Map(routes.map(route => [route.url, route])).values()].slice(0, MAX_URLS);
}
