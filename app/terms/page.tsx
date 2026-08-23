import type { Metadata } from "next";
import { LegalArticle } from "@/components/pages/LegalArticle";
import { terms } from "@/lib/legal/terms";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function Page() {
  return <LegalArticle doc={terms} />;
}
