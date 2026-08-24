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
    "Buy certified refurbished laptops in the UAE with warranty included. Fast delivery across the UAE. MacBooks, Dell, HP, Lenovo & more — inspected & tested.",
  keywords: [
    "refurbished laptops Dubai",
    "certified refurbished laptops UAE",
    "used laptops Dubai",
    "refurbished MacBook UAE",
    "refurbished Dell laptop Dubai",
    "refurbished HP laptop UAE",
    "refurbished Lenovo laptop Dubai",
    "second hand laptops UAE with warranty",
    "buy laptops online UAE",
    "Buyology",
  ],
  /**
   * Where the business trades — the locality signal behind "in Dubai" queries and the
   * Organization schema's address. Only what is actually known: no street line is invented.
   */
  place: {
    // The registered trading address, from the Google Business Profile — SHARJAH, not Dubai.
    // The storefront targets Dubai as a market it delivers to, which is `areaServed`; claiming
    // Dubai as the address would contradict GBP, and Google reconciles the two.
    street: "Industrial Area 17 - Industrial Area",
    locality: "Sharjah",
    region: "Sharjah",
    country: "AE",
    countryName: "United Arab Emirates",
    /** Cities the storefront actively delivers to and targets in search. */
    serves: ["Dubai", "Sharjah", "Abu Dhabi"],
  },
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
    // The real trading number, as published on the Buyology Factory Outlet Google Business
    // Profile. It must match GBP exactly: Google cross-checks the two, and an audit flagged
    // the site for showing no phone at all.
    phone: "+971 52 708 5203",
    phoneE164: "+971527085203",
  },
  social: {
    x: "https://x.com/buyology",
    instagram: "https://instagram.com/buyology.online",
    discord: "https://discord.gg/buyology",
  },
} as const;

/** Corporate/about site — a separate property from this storefront. */
export const WHO_WE_ARE_URL = "https://web.buyology.online";

export type Site = typeof site;
