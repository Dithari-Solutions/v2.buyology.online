import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { SupportForm } from "@/components/support/SupportForm";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.support.form.title, robots: { index: false, follow: false } };
}

export default function SupportPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-10">
        <SupportForm />
      </main>
    </>
  );
}
