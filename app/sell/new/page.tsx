import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { SellForm } from "@/components/sell/SellForm";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.sell.form.title, robots: { index: false, follow: false } };
}

export default function NewSellPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-10">
        <SellForm />
      </main>
    </>
  );
}
