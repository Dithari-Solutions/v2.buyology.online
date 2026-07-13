import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Get in touch with Buyology across the UAE, Qatar, Saudi Arabia, Bahrain and Azerbaijan.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
        <ContactView />
      </main>
    </>
  );
}
