import { Header } from "@/components/header/Header";
import { Stories } from "@/components/home/Stories";
import { CategoryBanners } from "@/components/home/CategoryBanners";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { BuyologyAI } from "@/components/home/BuyologyAI";
import { BuyologyServices } from "@/components/home/BuyologyServices";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Stories />
        <CategoryBanners />
        <FeatureStrip />
        <ProductCarousel />
        <BuyologyAI />
        <BuyologyServices />
      </main>
    </>
  );
}
