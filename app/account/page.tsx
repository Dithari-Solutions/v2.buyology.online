import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your Buyology profile, orders, addresses and security.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
        <AccountView />
      </main>
    </>
  );
}
