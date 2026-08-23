import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { SellDetail } from "@/components/sell/SellDetail";

export const metadata: Metadata = {
  title: "Sell",
  robots: { index: false, follow: false },
};

export default async function SellDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6 sm:py-10">
        <SellDetail sellId={id} />
      </main>
    </>
  );
}
