import type { MetadataRoute } from "next";
import { serverMarket } from "@/lib/market-server";

const PRIVATE_PATHS = ["/account", "/cart", "/wishlist", "/checkout", "/payment/", "/support/", "/repair/my", "/sell/my", "/api/"];
const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "Applebot-Extended"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = `https://${(await serverMarket()).host}`;
  return { rules: [
    { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE_PATHS },
  ], sitemap: `${origin}/sitemap.xml`, host: origin };
}
