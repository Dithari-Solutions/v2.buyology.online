import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { buyobot, services } from "@/lib/nav-data";
import { fetchCategories, fetchProducts, productHref } from "@/lib/catalogue";
import { categoryHref, renderableRoots } from "@/lib/category-nav";

/**
 * The sitemap is built from the LIVE catalogue, not from a hardcoded list.
 *
 * It previously submitted the static nav-data category slugs — the ones that never existed
 * server-side — so every category URL Google was told to crawl resolved to an empty page, which
 * is worse than omitting them: it spends crawl budget teaching the index that this site returns
 * thin results. Now the categories come from /api/category and real product URLs are included,
 * which is what actually earns product rich results.
 *
 * Catalogue lookups are best-effort: a sitemap that 500s is not served at all, so a failed
 * fetch degrades to the static routes rather than taking the whole file down.
 */
export const revalidate = 3600;

/** How many products to enumerate. Enough to matter, bounded so the file stays servable. */
const PRODUCT_PAGES = 8;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site.url, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/products`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/search`, lastModified, changeFrequency: "daily", priority: 0.6 },
  ];

  // Content pages: real answers to real queries (warranty, shipping, returns), and the pages
  // a shopper checks before buying refurbished.
  const contentRoutes: MetadataRoute.Sitemap = [
    "/about",
    "/help",
    "/shipping",
    "/warranty",
    "/returns",
    "/contact",
    "/track",
    "/privacy",
    "/terms",
    "/cookies",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = [...services, buyobot].map((s) => ({
    url: `${site.url}${s.href}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    // English taxonomy on purpose: the sitemap is the canonical set of URLs, and an English
    // slug reads the same to a crawler whatever language a visitor browses in.
    categoryRoutes = renderableRoots(await fetchCategories("en")).map((c) => ({
      url: `${site.url}${categoryHref(c)}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    /* the static routes still stand */
  }

  const productRoutes: MetadataRoute.Sitemap = [];
  try {
    const seen = new Set<string>();
    for (let page = 0; page < PRODUCT_PAGES; page += 1) {
      const { items, hasMore } = await fetchProducts("en", { page });
      for (const row of items) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          productRoutes.push({
            url: `${site.url}${productHref(row)}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }
      if (!hasMore) break;
    }
  } catch {
    /* a partial sitemap beats none */
  }

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...contentRoutes,
  ];
}
