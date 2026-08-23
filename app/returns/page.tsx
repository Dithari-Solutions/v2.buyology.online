import type { Metadata } from "next";
import { LegalArticle } from "@/components/pages/LegalArticle";
import { returns } from "@/lib/legal/returns";

export const metadata: Metadata = {
  title: "Returns & Refunds",
};

export default function Page() {
  return <LegalArticle doc={returns} />;
}
