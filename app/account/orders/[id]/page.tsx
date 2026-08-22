import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { OrderDetailView } from "@/components/account/OrderDetailView";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <OrderDetailView orderId={id} />
      </main>
    </>
  );
}
