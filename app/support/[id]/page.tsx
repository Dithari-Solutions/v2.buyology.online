import type { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { TicketDetail } from "@/components/support/TicketDetail";

export const metadata: Metadata = {
  title: "Support",
  robots: { index: false, follow: false },
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 sm:py-10">
        <TicketDetail ticketId={id} />
      </main>
    </>
  );
}
