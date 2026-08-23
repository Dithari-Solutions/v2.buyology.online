import { StaticPage } from "@/components/pages/StaticPage";
import { getDict, getLocale } from "@/lib/i18n/server";
import type { LegalDoc } from "@/lib/legal/types";

/**
 * Renders a ported legal document. The body is the company's legal text verbatim —
 * English only until legal provides reviewed translations — so non-English locales
 * get a small notice line instead of a machine-translated contract.
 */
export async function LegalArticle({ doc }: { doc: LegalDoc }) {
  const t = await getDict();
  const locale = await getLocale();
  const meta = [
    doc.effective ? `Effective date: ${doc.effective}` : null,
    doc.version ? `Version ${doc.version}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <StaticPage title={doc.title} subtitle={meta || undefined}>
      {locale !== "en" && (
        <p className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
          {t.pages.legalEnglishNote}
        </p>
      )}
      <article dir="ltr" className="space-y-4 text-start">
        {doc.blocks.map((b, i) => {
          if (b.type === "h2")
            return (
              <h2 key={i} className="pt-4 text-xl font-semibold text-foreground">
                {b.text}
              </h2>
            );
          if (b.type === "h3")
            return (
              <h3 key={i} className="pt-2 text-base font-semibold text-foreground">
                {b.text}
              </h3>
            );
          if (b.type === "ul")
            return (
              <ul key={i} className="list-disc space-y-1.5 ps-6 text-muted">
                {b.items.map((item, k) => (
                  <li key={k}>{item}</li>
                ))}
              </ul>
            );
          return (
            <p key={i} className="text-muted">
              {b.text}
            </p>
          );
        })}
      </article>
    </StaticPage>
  );
}
