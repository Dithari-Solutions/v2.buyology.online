import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header/Header";
import { dirFor, type Locale } from "@/lib/i18n/config";
import { getDict, getLocale } from "@/lib/i18n/server";
import { fetchAnnouncements, type Announcement } from "@/lib/news-api";
import { breadcrumbSchema, jsonLdScript } from "@/lib/structured-data";
import { site } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.news.metaTitle,
    description: t.news.metaDescription,
    alternates: { canonical: `${site.url}/news` },
    openGraph: {
      title: t.news.metaTitle,
      description: t.news.metaDescription,
      url: `${site.url}/news`,
      type: "website",
    },
  };
}

/** A post is written in one language whatever the site locale. Its title's first letter sets the
    direction for the post's whole text block, so its lines share one edge. */
function postDirFor(title: string, pageDir: "ltr" | "rtl"): "ltr" | "rtl" {
  const letter = title.match(/\p{L}/u)?.[0];
  if (!letter) return pageDir;
  return /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(letter) ? "rtl" : "ltr";
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AnnouncementsPage() {
  const t = await getDict();
  const locale = await getLocale();
  const items = (await fetchAnnouncements()) ?? [];

  const [lead, ...rest] = items;

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbSchema([
              { name: t.news.home, path: "/" },
              { name: t.news.title, path: "/news" },
            ]),
          ),
        }}
      />

      <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14">
        <header className="max-w-2xl">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-brand-icon">
            {t.news.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.1] tracking-tight [text-wrap:balance] sm:text-4xl">
            {t.news.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{t.news.intro}</p>
        </header>

        {items.length === 0 ? (
          <p className="mt-16 rounded-2xl border border-dashed border-border px-6 py-14 text-center text-sm text-muted">
            {t.news.empty}
          </p>
        ) : (
          <>
            {/* The newest announcement leads. A giveaway or a launch is worth more than a row
                in a grid, and there is always exactly one most-recent thing to say. */}
            <LeadCard item={lead} locale={locale} readMore={t.news.readMore} />

            {rest.length > 0 && (
              <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((item) => (
                  <li key={item.id}>
                    <ArticleCard item={item} locale={locale} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </>
  );
}

function LeadCard({
  item, locale, readMore,
}: { item: Announcement; locale: Locale; readMore: string }) {
  const pageDir = dirFor(locale);
  const postDir = postDirFor(item.title, pageDir);
  return (
    <article className="mt-10 overflow-hidden rounded-3xl border border-border bg-surface">
      {/* Side by side above md, stacked below. Full-width at 16:7 the hero was ~460px tall and
          pushed every other announcement off the screen — the lead should introduce the page,
          not consume it. */}
      <Link
        href={`/news/${item.slug}`}
        className="group grid focus-visible:outline-none md:grid-cols-[1.1fr_1fr] md:items-stretch"
      >
        {item.imageUrl && (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2 md:aspect-auto md:min-h-[320px]">
            <Image
              src={item.imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transform-none"
              priority
            />
          </div>
        )}
        {/* The column takes the post's direction; the date and the link keep the page's language,
            so each keeps its own text order and self-start puts it on the post's edge. */}
        <div dir={postDir} className="flex flex-col justify-center p-6 sm:p-8">
          <time dir={pageDir} className="self-start font-mono text-xs uppercase tracking-wider text-muted">
            {formatDate(item.publishedAt, locale)}
          </time>
          <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight [text-wrap:balance] group-hover:underline sm:text-3xl">
            {item.title}
          </h2>
          {item.summary && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{item.summary}</p>
          )}
          <span dir={pageDir} className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-icon">
            {readMore}
            {/* Not rtl:, which also matches anything inside an RTL post's column. */}
            <span aria-hidden="true" className={pageDir === "rtl" ? "-scale-x-100" : undefined}>&rarr;</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

function ArticleCard({ item, locale }: { item: Announcement; locale: Locale }) {
  const pageDir = dirFor(locale);
  return (
    <Link
      href={`/news/${item.slug}`}
      dir={postDirFor(item.title, pageDir)}
      className="group block focus-visible:outline-none"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-surface-2">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : (
          /* No thumbnail is normal — a short update rarely has one. The tile keeps its shape
             so the grid does not go ragged. */
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted opacity-60">
              Buyology
            </span>
          </div>
        )}
      </div>
      <time dir={pageDir} className="mt-4 block w-fit font-mono text-xs uppercase tracking-wider text-muted">
        {formatDate(item.publishedAt, locale)}
      </time>
      <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight [text-wrap:balance] group-hover:underline">
        {item.title}
      </h3>
      {item.summary && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{item.summary}</p>
      )}
    </Link>
  );
}
