import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header/Header";
import { getDict, getLocale } from "@/lib/i18n/server";
import { fetchAnnouncement } from "@/lib/news-api";
import { sanitizeArticle } from "@/lib/news/sanitize";
import { breadcrumbSchema, jsonLdScript } from "@/lib/structured-data";
import { site } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchAnnouncement(slug);
  if (!article) return { title: (await getDict()).news.metaTitle };

  const url = `${site.url}/news/${article.slug}`;
  return {
    title: `${article.title} — Buyology`,
    description: article.summary ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.summary ?? undefined,
      url,
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
  };
}

export default async function AnnouncementPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const [t, locale, article] = await Promise.all([
    getDict(),
    getLocale(),
    fetchAnnouncement(slug),
  ]);

  // A draft, a deleted post or a mistyped URL all land here. 404 rather than an empty shell,
  // so search engines drop it instead of indexing a blank page.
  if (!article) notFound();

  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(locale, {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  // Sanitised on the server, before it is ever markup in a browser.
  const body = sanitizeArticle(article.content);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary ?? undefined,
    datePublished: article.publishedAt ?? article.createdAt,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    mainEntityOfPage: `${site.url}/news/${article.slug}`,
    publisher: {
      "@type": "Organization",
      name: "Buyology",
      url: site.url,
    },
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbSchema([
              { name: t.news.home, path: "/" },
              { name: t.news.title, path: "/news" },
              { name: article.title, path: `/news/${article.slug}` },
            ]),
          ),
        }}
      />

      <main className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-icon hover:underline"
        >
          <span aria-hidden="true" className="rtl:-scale-x-100">&larr;</span>
          {t.news.backToAll}
        </Link>

        <article className="mt-8">
          <header>
            {published && (
              <time
                dateTime={article.publishedAt ?? undefined}
                className="font-mono text-xs uppercase tracking-wider text-muted"
              >
                {published}
              </time>
            )}
            <h1 className="mt-3 text-3xl font-semibold leading-[1.12] tracking-tight [text-wrap:balance] sm:text-4xl">
              {article.title}
            </h1>
            {article.summary && (
              <p className="mt-4 text-lg leading-relaxed text-muted">{article.summary}</p>
            )}
          </header>

          {article.imageUrl && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface-2">
              <Image
                src={article.imageUrl}
                alt=""
                fill
                sizes="(max-width: 760px) 100vw, 760px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Sanitised above. Typography is set here rather than in the editor's markup, so a
              post written months apart still looks like the rest of the site. */}
          <div
            className="buyo-prose mt-10"
            dangerouslySetInnerHTML={{ __html: body }}
          />

          {article.galleryUrls.length > 0 && (
            <section className="mt-12">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                {t.news.gallery}
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {article.galleryUrls.map((url) => (
                  <li key={url} className="relative aspect-square overflow-hidden rounded-xl bg-surface-2">
                    <Image
                      src={url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, 240px"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="mt-14 rounded-2xl border border-border bg-surface-2 p-6">
          <h2 className="text-base font-semibold">{t.news.subscribeTitle}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.news.subscribeBody}</p>
        </aside>
      </main>
    </>
  );
}
