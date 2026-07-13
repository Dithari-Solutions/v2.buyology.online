import type { Product } from "@/lib/products";

/**
 * Mock product-detail content (reviews, Q&A, AI summary, specs). Body text is
 * representative user-generated content kept in English; all surrounding UI
 * labels are localized via the `pdp` dictionary block.
 */

export type Review = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
  helpful: number;
};

export type Question = {
  id: string;
  q: string;
  a: string;
  asker: string;
  answerer: string;
  date: string;
  votes: number;
};

export type AiSummary = {
  /** Share of reviews that are positive. */
  positive: number;
  verdict: string;
  pros: string[];
  cons: string[];
  themes: { label: string; count: number }[];
};

/** Rating distribution 5★ → 1★ (percent). */
export const reviewDistribution = [79, 15, 3, 2, 1];

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Layla A.",
    initials: "LA",
    rating: 5,
    date: "2 weeks ago",
    title: "Exceeded my expectations",
    body: "Genuinely impressed. Setup took two minutes and it feels far more premium than the price suggests. Battery easily lasts me the whole week and the build quality is excellent.",
    verified: true,
    helpful: 42,
  },
  {
    id: "r2",
    author: "Omar K.",
    initials: "OK",
    rating: 5,
    date: "3 weeks ago",
    title: "Best purchase this year",
    body: "Fast delivery, beautifully packaged, and it just works. I compared three alternatives before buying and this was clearly the best value. Highly recommended.",
    verified: true,
    helpful: 28,
  },
  {
    id: "r3",
    author: "Sara M.",
    initials: "SM",
    rating: 4,
    date: "1 month ago",
    title: "Great, with one small niggle",
    body: "Love almost everything about it. Performance is smooth and it looks stunning. The companion app could be a little more polished, but that's a minor complaint.",
    verified: true,
    helpful: 19,
  },
  {
    id: "r4",
    author: "Daniyar T.",
    initials: "DT",
    rating: 5,
    date: "1 month ago",
    title: "Worth every dirham",
    body: "The attention to detail is obvious the moment you unbox it. Everything from the materials to the finish feels considered. Customer support was helpful too.",
    verified: true,
    helpful: 15,
  },
  {
    id: "r5",
    author: "Nadia R.",
    initials: "NR",
    rating: 4,
    date: "2 months ago",
    title: "Very happy overall",
    body: "Does exactly what I hoped and the design gets compliments. Slightly wish it came in more colours, but the quality is not in question. Would buy again.",
    verified: false,
    helpful: 8,
  },
];

export const questions: Question[] = [
  {
    id: "q1",
    q: "Does it come with an international warranty?",
    a: "Yes — every Buyology product includes a 2-year warranty that's valid across all our regions, plus 14-day free returns.",
    asker: "Hassan",
    answerer: "Buyology",
    date: "3 weeks ago",
    votes: 34,
  },
  {
    id: "q2",
    q: "Is it compatible with both iOS and Android?",
    a: "It works seamlessly with both. The companion app is available on the App Store and Google Play, and core features work without any account.",
    asker: "Mariam",
    answerer: "Buyology",
    date: "1 month ago",
    votes: 21,
  },
  {
    id: "q3",
    q: "How long does delivery usually take?",
    a: "Orders placed before 8pm are delivered next day across most of the UAE, with free delivery on orders over 100 AED.",
    asker: "Yusuf",
    answerer: "Buyology",
    date: "1 month ago",
    votes: 12,
  },
];

export const aiSummary: AiSummary = {
  positive: 94,
  verdict:
    "Buyers consistently praise the premium build and strong value, describing setup as quick and the everyday experience as reliable. A small number would like a more polished companion app and more colour options.",
  pros: [
    "Premium build and finish",
    "Excellent value for money",
    "Quick, hassle-free setup",
    "Reliable everyday performance",
  ],
  cons: ["Companion app could be smoother", "Limited colour choices"],
  themes: [
    { label: "Build quality", count: 312 },
    { label: "Value", count: 254 },
    { label: "Battery", count: 189 },
    { label: "Design", count: 147 },
    { label: "Support", count: 96 },
  ],
};

/** Localized-label spec rows: labels come from the dictionary, values here. */
export function getSpecValues(p: Product) {
  return {
    brand: "Buyology",
    model: p.name,
    category: p.category,
    warranty: "24 months",
    box: `${p.name}, USB-C cable, quick-start guide`,
    rating: `${p.rating.toFixed(1)} / 5`,
  };
}

/** Product colour options (mock; shared across catalogue). */
export const colorOptions = [
  { id: "midnight", label: "Midnight", hex: "#2e1065" },
  { id: "silver", label: "Silver", hex: "#c8ccd6" },
  { id: "gold", label: "Gold", hex: "#e5a800" },
];

/** Configuration / bundle options (mock). */
export const bundleOptions = [
  { id: "standard", label: "Standard" },
  { id: "plus", label: "Plus bundle", extra: 49 },
  { id: "pro", label: "Pro bundle", extra: 99 },
];
