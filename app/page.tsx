import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { Stories } from "@/components/home/Stories";
import { GiveawayBanner } from "@/components/home/GiveawayBanner";
import { RefurbishedIntro } from "@/components/home/RefurbishedIntro";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { FeatureStrip } from "@/components/home/FeatureStrip";
// Flash-sale rail: mock data — parked until a real flash-sale feed exists.
// import { ProductCarousel } from "@/components/home/ProductCarousel";
import { BuyologyAI } from "@/components/home/BuyologyAI";
import { Metrics } from "@/components/home/Metrics";
import { BuyologyServices } from "@/components/home/BuyologyServices";

/**
 * The home page carries the commercial title, not the brand tagline: this is the page that
 * competes for "refurbished laptops Dubai", and a title of "Buyology — Buy the why" tells a
 * searcher nothing about what is sold. `absolute` opts out of the "· Buyology" template so the
 * brand is not repeated twice in one title.
 */
export const metadata: Metadata = {
  title: {
    absolute: "Buy Certified Refurbished Laptops in Dubai – Buyology",
  },
  description:
    "Buy certified refurbished laptops in the UAE with warranty included. Fast delivery across the UAE. MacBooks, Dell, HP, Lenovo & more — inspected & tested.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Buy Certified Refurbished Laptops in Dubai – Buyology",
    description:
      "Certified refurbished laptops with warranty, delivered across the UAE. MacBooks, Dell, HP, Lenovo & more — inspected & tested.",
    url: "/",
    type: "website",
  },
  twitter: {
    title: "Buy Certified Refurbished Laptops in Dubai – Buyology",
    description:
      "Certified refurbished laptops with warranty, delivered across the UAE. Inspected & tested.",
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Stories />
        {/* The page's H1 and subject, before the promotional furniture. */}
        <RefurbishedIntro />
        <GiveawayBanner />
        <CategoryBanners />
        <FeatureStrip />
        {/* <ProductCarousel /> */}
        <BuyologyAI />
        <Metrics />
        <BuyologyServices />
      </main>
    </>
  );
}
