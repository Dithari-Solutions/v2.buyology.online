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
  // Primary tagline (Brand Identity Guidelines, Tagline 2).
  tagline: "Buy the why",
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
  // Names and hexes come from the Brand Identity Guidelines (Color 4–6):
  // Mikado Yellow is primary, American Blue secondary, Black tertiary.
  colors: {
    // American Blue (secondary) + its published tints.
    brand: "#402f75",
    brand400: "#665991",
    brand300: "#8c82ac",
    brand200: "#b3acc8",
    brand100: "#d9d5e3",
    brandDeep: "#2b1f52",
    // Mikado Yellow (primary) + its published tints.
    gold: "#ffbe12",
    gold400: "#ffcb41",
    gold300: "#ffd871",
    gold200: "#ffe5a0",
    gold100: "#fff2d0",
    goldDeep: "#e0a710",
    darkBg: "#000000",
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
