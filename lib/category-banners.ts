/**
 * Mock data for the home "departments" region. Image paths point to on-brand
 * placeholders in /public/mock — swap the `image` values for real photography
 * (keep the same aspect ratios: ~16:10 heroes, 4:3 tiles) and the UI is unchanged.
 */

export type CarouselSlide = {
  id: string;
  eyebrow: string;
  headline: string;
  subline: string;
  cta: { label: string; href: string };
  link: { label: string; href: string };
  image: string;
  /** Descriptive alt text for the slide background. */
  alt: string;
};

export type CategoryTile = {
  title: string;
  slug: string;
  image: string;
  alt: string;
  blurb: string;
};

/** The two stacked promo tiles in the right column of the departments region. */
export type PromoTile = {
  id: string;
  eyebrow: string;
  title: string;
  href: string;
  image: string;
  alt: string;
};

export const promoTiles: PromoTile[] = [
  {
    id: "gaming-gear",
    eyebrow: "Save up to 40%",
    title: "Gaming Gear",
    href: "/category/gaming",
    image: "/mock/cat-gaming.jpg",
    alt: "Purple gradient promoting discounted Buyology gaming gear",
  },
  {
    id: "new-wearables",
    eyebrow: "Just landed",
    title: "New Wearables",
    href: "/category/wearables",
    image: "/mock/cat-wearables.jpg",
    alt: "Purple gradient promoting Buyology's new wearables",
  },
];

export const carouselSlides: CarouselSlide[] = [
  {
    id: "sale",
    eyebrow: "Mega Tech Sale",
    headline: "Up to 40% off future tech",
    subline:
      "Thousands of next-gen gadgets, dropped to their lowest prices of the year.",
    cta: { label: "Shop the sale", href: "/category/deals" },
    link: { label: "See all offers", href: "/search?category=deals" },
    image: "/mock/hero-sale.jpg",
    alt: "Deep purple gradient with a gold light burst promoting the Buyology Mega Tech Sale",
  },
  {
    id: "wearables",
    eyebrow: "Just landed",
    headline: "The new wearables",
    subline: "Smart rings, health bands and titanium watches built for tomorrow.",
    cta: { label: "Explore wearables", href: "/category/wearables" },
    link: { label: "View New In", href: "/search?category=new-in" },
    image: "/mock/hero-wearables.jpg",
    alt: "Violet gradient with a soft glow highlighting Buyology's new wearables collection",
  },
  {
    id: "ai",
    eyebrow: "Powered by Buyobot",
    headline: "AI-picked drops",
    subline: "Personalised product edits, curated for you by our neural assistant.",
    cta: { label: "See your picks", href: "/buyobot" },
    link: { label: "How it works", href: "/buyobot" },
    image: "/mock/hero-ai.jpg",
    alt: "Purple and gold gradient representing Buyology's AI-curated product drops",
  },
];

export const categoryTiles: CategoryTile[] = [
  {
    title: "Electronics",
    slug: "electronics",
    image: "/mock/cat-electronics.jpg",
    alt: "Premium purple gradient tile for the Electronics department",
    blurb: "Gadgets & devices",
  },
  {
    title: "Audio",
    slug: "audio",
    image: "/mock/cat-audio.jpg",
    alt: "Premium purple gradient tile for the Audio department",
    blurb: "Headphones & speakers",
  },
  {
    title: "Gaming",
    slug: "gaming",
    image: "/mock/cat-gaming.jpg",
    alt: "Premium purple gradient tile for the Gaming department",
    blurb: "Consoles & accessories",
  },
  {
    title: "Computing",
    slug: "computing",
    image: "/mock/cat-computing.jpg",
    alt: "Premium purple gradient tile for the Computing department",
    blurb: "Laptops & desktops",
  },
  {
    title: "Wearables",
    slug: "wearables",
    image: "/mock/cat-wearables.jpg",
    alt: "Premium purple gradient tile for the Wearables department",
    blurb: "Watches & smart rings",
  },
  {
    title: "Home",
    slug: "home",
    image: "/mock/cat-home.jpg",
    alt: "Premium purple gradient tile for the Home department",
    blurb: "Smart home & living",
  },
];
