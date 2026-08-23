import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/header/Header";
import { PaymentCallbackView } from "@/components/checkout/PaymentCallbackView";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

export default function PaymentCallbackPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <Suspense fallback={null}>
          <PaymentCallbackView />
        </Suspense>
      </main>
    </>
  );
}
