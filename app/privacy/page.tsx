import type { Metadata } from "next";
import { LegalArticle } from "@/components/pages/LegalArticle";
import { privacy } from "@/lib/legal/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function Page() {
  return <LegalArticle doc={privacy} />;
}
