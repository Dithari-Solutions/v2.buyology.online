import sanitizeHtml from "sanitize-html";

/**
 * What an announcement is allowed to contain.
 *
 * The body is rich text an admin composed in the dashboard, and it renders to every visitor with
 * dangerouslySetInnerHTML — so it is sanitised on the server, before it is ever markup. An
 * allowlist rather than a blocklist: the set of tags a news post legitimately needs is small and
 * knowable, while the set of ways to smuggle script through a blocklist is neither.
 *
 * A real parser does this rather than a regex. Hand-rolled HTML sanitisers are a well-known source
 * of bypasses, and this content reaches the public page of a shop.
 */
export function sanitizeArticle(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr",
      "h2", "h3", "h4",
      "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li",
      "blockquote", "code", "pre",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "width", "height"],
    },
    // No javascript:, no data: — the two schemes that turn a link or an image into script.
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    // Every outbound link leaves in a new tab and cannot reach back into this page.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
    // Drop the contents of anything disallowed, rather than leaving its text behind.
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  });
}
