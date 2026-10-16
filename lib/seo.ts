import type { Metadata } from "next";
import { headers } from "next/headers";
import { getLocale } from "@/lib/i18n/server";
import { serverMarket } from "@/lib/market-server";
import { site } from "@/lib/site";

/** Real public content, shared with the sitemap. Unavailable services are intentionally absent. */
export const SEO_PAGES: Record<string, { title: string; description: string }> = {
  "/": { title: "Refurbished Laptops & Tablets in UAE", description: "Shop quality-checked refurbished laptops and tablets at Buyology. Compare available models, prices and warranty information, with delivery across the UAE." },
  "/products": { title: "Refurbished Laptops, Tablets & Electronics", description: "Compare available refurbished laptops, tablets and electronics at Buyology. Browse by category and brand, with current prices, specifications and availability." },
  "/about": { title: "About Buyology", description: "Learn about Buyology, our approach to refurbished technology, and how we help customers find quality-checked laptops, tablets and electronics." },
  "/help": { title: "Customer Help & Support", description: "Find help with Buyology orders, delivery, payments, returns and warranty questions. Contact our support team when you need assistance." },
  "/shipping": { title: "Shipping & Delivery", description: "Read Buyology shipping and delivery information, including delivery options and how to get help with your order." },
  "/warranty": { title: "Product Warranty & Support", description: "Understand Buyology warranty information for refurbished electronics and how to contact support about a product issue." },
  "/returns": { title: "Returns & Refunds Policy", description: "Read Buyology return and refund conditions, eligibility, time limits and the steps for requesting help with a purchase." },
  "/contact": { title: "Contact Buyology", description: "Contact Buyology customer support for help with products, orders and after-sales questions. Find our support email, phone number and outlet details." },
  "/privacy": { title: "Privacy Policy", description: "Read how Buyology handles account, order and website information, your privacy choices, and how to contact us with a data request." },
  "/terms": { title: "Terms & Conditions", description: "Read the terms governing purchases and use of Buyology, including customer accounts, orders, payments and product information." },
  "/cookies": { title: "Cookies & Privacy Preferences", description: "See which cookies and browser storage Buyology uses, understand optional analytics and marketing, and manage your cookie preferences." },
  "/news": { title: "Buyology News & Announcements", description: "Read the latest published Buyology announcements, product updates and store news." },
};
const ENGLISH_CONTENT = new Set(["/privacy", "/terms", "/cookies", "/returns"]);
const localeNames = { en: "en_US", ar: "ar_AE", az: "az_AZ" } as const;

/** Preserve meaningful catalogue filters; language variants have stable, crawlable query URLs. */
export async function pageMetadata(path: string, input: Metadata = {}): Promise<Metadata> {
  const [locale, market, requestHeaders] = await Promise.all([getLocale(), serverMarket(), headers()]);
  const url = new URL(path, `https://${market.host}`);
  const pathOnly = url.pathname;
  const defaults = SEO_PAGES[pathOnly];
  const supportsLanguages = !ENGLISH_CONTENT.has(pathOnly) && !pathOnly.startsWith("/news/");
  const canonical = new URL(url);
  if (supportsLanguages && locale !== "en") canonical.searchParams.set("lang", locale);
  else canonical.searchParams.delete("lang");
  const languages: Record<string, string> = {};
  for (const language of supportsLanguages ? ["en", "ar", "az"] : ["en"]) {
    const variant = new URL(url);
    if (language === "en") variant.searchParams.delete("lang"); else variant.searchParams.set("lang", language);
    languages[language] = variant.href;
  }
  languages["x-default"] = languages.en;
  const title = input.title ?? defaults?.title ?? site.name;
  const description = (input.description || defaults?.description || site.description)
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/\s+/g, " ").trim().slice(0, 165);
  const heading = typeof title === "string" ? title : "absolute" in title ? title.absolute : defaults?.title ?? site.name;
  const preview = (requestHeaders.get("host") ?? "").split(":")[0] === "v2.buyology.online";
  const indexable = Boolean(defaults || /^\/(product|news)\/[^/]+$/.test(pathOnly));
  return {
    ...input, title: typeof title === "string" && /\bBuyology\b/i.test(title) ? { absolute: title } : title, description,
    alternates: { ...input.alternates, canonical: canonical.href, languages: pathOnly.startsWith("/news/") ? undefined : languages },
    openGraph: { ...input.openGraph, title: heading ?? site.name, description, siteName: site.name,
      type: input.openGraph && "type" in input.openGraph ? input.openGraph.type : "website", url: canonical.href, locale: pathOnly.startsWith("/news/") ? undefined : localeNames[ENGLISH_CONTENT.has(pathOnly) ? "en" : locale] },
    twitter: { ...input.twitter, title: heading ?? site.name, description },
    ...(!indexable || preview ? { robots: { index: false, follow: true } } : {}),
  };
}
