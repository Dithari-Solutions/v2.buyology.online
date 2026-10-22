import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { Stories } from "@/components/home/Stories";
import { GiveawayBanner } from "@/components/home/GiveawayBanner";
import { RefurbishedIntro } from "@/components/home/RefurbishedIntro";
import { HomeFaq } from "@/components/home/HomeFaq";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { PopularProducts } from "@/components/home/PopularProducts";
import { BuyologyAI } from "@/components/home/BuyologyAI";
import { Metrics } from "@/components/home/Metrics";
import { getDict, getLocale } from "@/lib/i18n/server";
import { BuyologyServices } from "@/components/home/BuyologyServices";

/**
 * The home page carries the commercial title, not the brand tagline: this is the page that
 * competes for "refurbished laptops Dubai", and a title of "Buyology — Buy the why" tells a
 * searcher nothing about what is sold. `absolute` opts out of the "· Buyology" template so the
 * brand is not repeated twice in one title.
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  if (locale !== "en") {
    const { refurbished } = await getDict();
    return pageMetadata("/", { title: refurbished.h1, description: refurbished.lead });
  }
  return pageMetadata("/", {
  title: {
    absolute: "Refurbished Laptops & Tablets in UAE | Buyology",
  },
  description:
    "Shop quality-checked refurbished laptops and tablets at Buyology. Compare available models, prices and warranty information, with delivery across the UAE.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Refurbished Laptops & Tablets in UAE | Buyology",
    description:
      "Certified refurbished laptops with warranty, delivered across the UAE. MacBooks, Dell, HP, Lenovo & more — inspected & tested.",
    url: "/",
    type: "website",
  },
  twitter: {
    title: "Refurbished Laptops & Tablets in UAE | Buyology",
    description:
      "Certified refurbished laptops with warranty, delivered across the UAE. Inspected & tested.",
  },
});
}

export default async function Home() {
  // Resolve variable-height content before emitting the sections below it to avoid layout jumps.
  const [giveaway, departments] = await Promise.all([GiveawayBanner(), CategoryBanners()]);
  return (
    <>
      <Header />
      <main>
        <Stories />
        {giveaway}
        {departments}
        <FeatureStrip />
        <PopularProducts />
        {/* Flash sale. Fetches in the browser and renders nothing until it has something on sale,
            so it never delays this page and never leaves an empty rail behind. */}
        <ProductCarousel />
        <BuyologyAI />
        <BuyologyServices />
        {/* Closing statement: what this shop actually sells, in the words people search for.
            It carries the page's H1, so it stays in the document even at the end. */}
        <RefurbishedIntro />
        <HomeFaq />
        {/* Last, immediately above the footer. The numbers are a closing reassurance rather than
            something to walk past on the way to the products, which is what they were sitting
            mid-page between the AI panel and the services grid. */}
        <Metrics />
      </main>
    </>
  );
}
