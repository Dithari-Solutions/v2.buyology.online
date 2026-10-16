import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { LegalArticle } from "@/components/pages/LegalArticle";
import { returns } from "@/lib/legal/returns";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/returns", {
  title: "Returns & Refunds",
});
}

export default function Page() {
  return <LegalArticle doc={returns} />;
}
