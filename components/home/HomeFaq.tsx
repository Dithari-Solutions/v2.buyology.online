import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { faqSchema, jsonLdScript } from "@/lib/structured-data";

/**
 * The questions people actually ask before buying a refurbished laptop, answered on the page.
 *
 * Two audiences, one section. Shoppers get the objections addressed where they arise — what
 * "refurbished" means here, who covers the warranty, whether it can go back. Search engines and
 * assistants get question-and-answer structure they can quote directly, which is what the audit
 * meant by "answer alignment": a page with no Q&A has nothing an AI answer can lift.
 *
 * Every answer matches what the linked page says. An FAQ that promises more than the warranty
 * page delivers is worse than no FAQ.
 */
export async function HomeFaq() {
  const t = await getDict();
  const f = t.faq;

  const items = [
    { q: f.q1, a: f.a1 },
    { q: f.q2, a: f.a2 },
    { q: f.q3, a: f.a3 },
    { q: f.q4, a: f.a4 },
    { q: f.q5, a: f.a5 },
    { q: f.q6, a: f.a6 },
  ];

  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqSchema(items)) }}
      />
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 lg:p-10">
        <h2
          id="faq-heading"
          className="text-xl font-bold tracking-tight text-foreground sm:text-2xl"
        >
          {f.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{f.subtitle}</p>

        <dl className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <div key={item.q} className="rounded-2xl border border-border bg-surface-2 p-4 sm:p-5">
              <dt className="text-sm font-semibold text-foreground">{item.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/help"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {f.helpCta}
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {f.contactCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
