import { site } from "@/lib/site";
import type { Product } from "@/lib/products";
import { productHref } from "@/lib/catalogue";

/**
 * Typed Schema.org (JSON-LD) builders. Rendered server-side in the root layout
 * so Google AND AI agents (ChatGPT, Claude, Perplexity, Gemini) can reliably
 * identify the brand, its channels, and its on-site search action.
 *
 * Loosely typed as records — schema.org has no official TS types shipped here,
 * and community typings (schema-dts) aren't a dependency of this project.
 */
type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    // A PLAIN STRING, not ["Organization","OnlineStore"]. The array is valid schema.org, but
    // many crawlers and audit tools match @type as a string and report "no Organization schema
    // identified" — which is exactly what happened. The store-ness is expressed by the separate
    // Store node below instead, where it costs nothing.
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: {
      "@type": "ImageObject",
      url: `${site.url}/buyology-logo.png`,
      width: 6400,
      height: 6400,
    },
    description: site.description,
    slogan: site.tagline,
    sameAs: [site.social.x, site.social.instagram, site.social.discord],
    // Only what is known. No street line and no telephone: site.contact.phone is still a
    // placeholder, and a fabricated number in structured data would be published straight
    // into search results.
    telephone: site.contact.phoneE164,
    address: postalAddress(),
    areaServed: [
      { "@type": "Country", name: site.place.countryName },
      ...site.place.serves.map((city) => ({ "@type": "City", name: city })),
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.contact.email,
      telephone: site.contact.phoneE164,
      areaServed: site.place.country,
      availableLanguage: ["English", "Arabic"],
    },
  };
}

/** The trading address, shared by the Organization and Store nodes. */
function postalAddress(): JsonLd {
  return {
    "@type": "PostalAddress",
    streetAddress: site.place.street,
    addressLocality: site.place.locality,
    addressRegion: site.place.region,
    addressCountry: site.place.country,
  };
}

/**
 * The physical outlet, as a Store.
 *
 * This is what local packs and map results are built from, and it is why the audit's "add
 * Local Business Schema" item exists. Everything here matches the Google Business Profile
 * exactly — a schema that disagrees with GBP is worse than none, because Google reconciles
 * the two and trusts neither.
 *
 * No aggregateRating: the 4.9/132 belongs to Google's own review corpus, and marking up
 * reviews collected elsewhere as your own is against their structured-data guidelines.
 * No openingHours either — they are not known here, and inventing them sends real customers
 * to a closed door.
 */
export function storeSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${site.url}/#store`,
    name: "Buyology Factory Outlet",
    url: site.url,
    telephone: site.contact.phoneE164,
    email: site.contact.email,
    image: `${site.url}/buyology-logo.png`,
    address: postalAddress(),
    parentOrganization: { "@id": `${site.url}/#organization` },
    areaServed: site.place.serves.map((city) => ({ "@type": "City", name: city })),
  };
}

/**
 * Breadcrumb trail. Google renders this as the path shown under a result's title instead of
 * a bare URL, so it is one of the cheapest ways to make a listing read well.
 */
export function breadcrumbSchema(
  trail: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  };
}

export function webSiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en-US",
    publisher: { "@id": `${site.url}/#organization` },
    // Sitelinks searchbox — powers Google's search box and tells agents how to query.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Product schema for a detail page — price, availability, condition and rating, which is what
 * a rich result is built from.
 *
 * Everything here must be TRUE of the page it sits on, because Google cross-checks structured
 * data against visible content and penalises listings that disagree with it. So: the real
 * photo rather than a stock showcase image, the real manufacturer rather than "Buyology" as
 * the brand of every product, real availability rather than a hardcoded InStock, and the
 * rating block only when there are actually reviews behind it — a 0-review rating is both
 * invalid to Google and a lie to a shopper.
 *
 * itemCondition is RefurbishedCondition: it is the single most important field for this
 * catalogue, since "certified refurbished" is exactly what the listings are competing on.
 */
export function productSchema(p: Product): JsonLd {
  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    category: p.category,
    sku: p.id,
    itemCondition: "https://schema.org/RefurbishedCondition",
    brand: { "@type": "Brand", name: p.brand?.trim() || site.name },
    offers: {
      "@type": "Offer",
      url: `${site.url}${productHref(p)}`,
      priceCurrency: p.currency ?? "AED",
      price: p.price,
      itemCondition: "https://schema.org/RefurbishedCondition",
      availability:
        p.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: { "@id": `${site.url}/#organization` },
    },
  };

  // Presigned catalogue photos are absolute URLs; the mock placeholders are site-relative.
  if (p.image) {
    schema.image = p.image.startsWith("http") ? p.image : `${site.url}${p.image}`;
  }
  if (p.reviews > 0 && p.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return schema;
}

/** Convenience: everything the layout injects, as one @graph document. */
export function siteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), webSiteSchema(), storeSchema()],
  };
}

/**
 * Serialize JSON-LD for a <script> tag, escaping `<` to `<` to prevent
 * XSS via string injection (per the Next.js JSON-LD guidance).
 */
export function jsonLdScript(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
