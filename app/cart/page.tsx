import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review the items in your Buyology cart and check out.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
        <CartView />
      </main>
    </>
  );
}
