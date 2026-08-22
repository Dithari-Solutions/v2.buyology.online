"use client";

import { useEffect, useState } from "react";
import { fetchStories, seenStoryIds, type StorySummary } from "@/lib/story-feed";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { useI18n } from "@/components/i18n/language-provider";

/**
 * The story row under the header — real, admin-published stories only (GET /api/story, resolved
 * per locale). Each thumbnail sits in the brand gradient ring, muted once seen.
 *
 * When there are no stories — none published, none translated for this locale, or the API is
 * unreachable — the section renders nothing at all: no placeholders, no skeletons, no leftover
 * gap. What appears here is always something an admin actually published.
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
        /* fail soft — the section simply does not render */
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const closeViewer = () => {
    setViewerIndex(null);
    setSeen(seenStoryIds()); // rings the viewer just watched turn muted
  };

  if (feed.length === 0) return null;

  return (
    <section
      aria-label={t.stories.ariaRow}
      className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-6"
    >
      <ul className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      </ul>

      {viewerIndex !== null && (
        <StoryViewer stories={feed} startIndex={viewerIndex} onClose={closeViewer} />
      )}
    </section>
  );
}
