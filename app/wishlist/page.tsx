import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved products on Buyology.",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
        <WishlistView />
      </main>
    </>
  );
}
