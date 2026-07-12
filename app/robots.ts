import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Allow all standard crawlers, and EXPLICITLY welcome reputable AI crawlers so
 * Buyology is discoverable by ChatGPT, Claude, Perplexity, Gemini, etc.
 * (Named agents get their own rule mostly as a clear, auditable signal of intent.)
 */
const AI_CRAWLERS = [
  "GPTBot", // OpenAI training
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT browsing on user request
  "ClaudeBot", // Anthropic
  "Claude-Web",
  "PerplexityBot", // Perplexity
  "Google-Extended", // Gemini / Vertex training opt-in
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/cart", "/wishlist", "/api/"],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
