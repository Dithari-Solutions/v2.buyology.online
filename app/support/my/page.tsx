import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { MyTickets } from "@/components/support/MyTickets";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.support.list.title, robots: { index: false, follow: false } };
}

export default function MyTicketsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-6 sm:py-10">
        <MyTickets />
      </main>
    </>
  );
}
