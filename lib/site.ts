/**
 * Single source of truth for brand + site-wide constants. Everything that
 * needs the canonical URL, name, or social profiles (metadata, JSON-LD,
 * sitemap, robots, manifest) imports from here so there is one place to edit.
 */
export const site = {
  name: "Buyology",
  legalName: "Buyology",
  domain: "buyology.online",
  url: "https://buyology.online",
  tagline: "The marketplace for the future you",
  description:
    "Buyology is a premium futuristic marketplace for electronics, audio, gaming, computing, wearables and home tech — with voice search, an AI shopping assistant, and complimentary orbital delivery.",
  keywords: [
    "Buyology",
    "futuristic marketplace",
    "premium electronics store",
    "AI shopping assistant",
    "voice search shopping",
    "audio",
    "gaming",
    "computing",
    "wearables",
    "smart home",
  ],
  // Brand palette — kept in sync with globals.css theme tokens.
  colors: {
    brand: "#402f75",
    brandDeep: "#2e1065",
    gold: "#fbbb14",
    goldDeep: "#e5a800",
    darkBg: "#08060d",
    lightBg: "#ffffff",
  },
  contact: {
    email: "support@buyology.online",
    phone: "+1-000-000-0000",
  },
  social: {
    x: "https://x.com/buyology",
    instagram: "https://instagram.com/buyologyuae",
    discord: "https://discord.gg/buyology",
  },
} as const;

export type Site = typeof site;
