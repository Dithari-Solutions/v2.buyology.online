"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { stories as staticStories } from "@/lib/stories";
import { fetchStories, seenStoryIds, type StorySummary } from "@/lib/story-feed";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { useI18n } from "@/components/i18n/language-provider";

/**
 * Story bubbles under the header: the REAL admin-published stories first (thumbnail in the brand
 * gradient ring — muted once seen), followed by the category/service shortcuts that have always
 * lived here. If the story API is unreachable or empty, the row is exactly the static row it was
 * before — a network problem must never cost the shortcuts.
 */
export function Stories() {
  const { t, locale } = useI18n();
  const [feed, setFeed] = useState<StorySummary[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Fetched per mount and per language on purpose: media URLs are presigned with a 2-hour TTL
    // and the backend resolves translations server-side, so neither can be cached client-side.
    fetchStories(locale)
      .then((data) => {
        if (cancelled) return;
        setFeed(data);
        setSeen(seenStoryIds());
      })
      .catch(() => {
        /* fail soft — the static shortcuts still render */
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const closeViewer = () => {
    setViewerIndex(null);
    setSeen(seenStoryIds()); // rings the viewer just watched turn muted
  };

  return (
    <section
      aria-label={t.stories.ariaRow}
      className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-6"
    >
      <ul className="flex justify-between gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {feed.map((story, index) => {
          const isSeen = seen.has(story.id);
          return (
            <li key={story.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setViewerIndex(index)}
                className="group flex w-[76px] flex-col items-center gap-2 rounded-xl focus-visible:outline-none"
              >
                <span
                  className={`rounded-full p-[2.5px] transition-transform duration-300 group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background ${
                    isSeen
                      ? "bg-border"
                      : "bg-gradient-to-br from-brand via-brand-icon to-gold"
                  }`}
                >
                  <span className="block rounded-full bg-background p-[3px]">
                    {story.thumbnailUrl ? (
                      // Plain <img>: the URL is a presigned S3 GET that changes every request and
                      // expires — next/image optimization would cache dead links and needs
                      // remotePatterns churn for zero benefit.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={story.thumbnailUrl}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                    ) : (
                      <span className="block h-14 w-14 rounded-full bg-gradient-to-br from-brand/25 to-gold/20" />
                    )}
                  </span>
                </span>
                <span className="w-full truncate text-center text-xs font-medium text-foreground">
                  {story.title}
                </span>
              </button>
            </li>
          );
        })}
        {staticStories.map((story) => {
          const Icon = story.icon;
          return (
            <li key={story.key} className="shrink-0">
              <Link
                href={story.href}
                className="group flex w-[76px] flex-col items-center gap-2 rounded-xl focus-visible:outline-none"
              >
                <span className="rounded-full bg-gradient-to-br from-brand via-brand-icon to-gold p-[2.5px] transition-transform duration-300 group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background">
                  <span className="block rounded-full bg-background p-[3px]">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-gold/15 text-brand-icon">
                      <Icon className="h-6 w-6" />
                    </span>
                  </span>
                </span>
                <span className="w-full truncate text-center text-xs font-medium text-foreground">
                  {t.items[story.key].label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {viewerIndex !== null && feed.length > 0 && (
        <StoryViewer stories={feed} startIndex={viewerIndex} onClose={closeViewer} />
      )}
    </section>
  );
}
