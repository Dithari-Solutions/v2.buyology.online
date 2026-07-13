import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { ProductsView } from "@/components/products/ProductsView";

export const metadata: Metadata = {
  title: "All products",
  description:
    "Browse the full Buyology catalogue — audio, wearables, computing, gaming and smart home, with filters and sorting.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
        <ProductsView initialCategory={category} />
      </main>
    </>
  );
}
