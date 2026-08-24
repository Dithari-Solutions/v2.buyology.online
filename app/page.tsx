import { Header } from "@/components/header/Header";
import { Stories } from "@/components/home/Stories";
import { GiveawayBanner } from "@/components/home/GiveawayBanner";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { FeatureStrip } from "@/components/home/FeatureStrip";
// Flash-sale rail: mock data — parked until a real flash-sale feed exists.
// import { ProductCarousel } from "@/components/home/ProductCarousel";
import { BuyologyAI } from "@/components/home/BuyologyAI";
import { Metrics } from "@/components/home/Metrics";
import { BuyologyServices } from "@/components/home/BuyologyServices";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Stories />
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
