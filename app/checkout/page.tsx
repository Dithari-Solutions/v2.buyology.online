import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <CheckoutView />
      </main>
    </>
  );
}
