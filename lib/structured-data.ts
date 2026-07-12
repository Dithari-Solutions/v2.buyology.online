import { site } from "@/lib/site";

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
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: site.contact.email,
      availableLanguage: ["English"],
    },
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

/** Convenience: everything the layout injects, as one @graph document. */
export function siteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), webSiteSchema()],
  };
}

/**
 * Serialize JSON-LD for a <script> tag, escaping `<` to `<` to prevent
 * XSS via string injection (per the Next.js JSON-LD guidance).
 */
export function jsonLdScript(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
