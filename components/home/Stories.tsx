"use client";

import { useEffect, useState } from "react";
import { fetchStories, seenStoryIds, type StorySummary } from "@/lib/story-feed";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "@/components/auth/auth-provider";

/**
 * The story row under the header — real, admin-published stories only (GET /api/story, resolved
 * per locale). Each thumbnail sits in the brand gradient ring, muted once seen.
 *
 * Three states:
 * - loading  → skeleton bubbles with the exact geometry of the real ones, so nothing jumps;
 * - empty    → the section renders nothing (no stories published/translated, or the API failed);
 * - loaded   → the stories, as a content-width centered cluster.
 *
 * Layout note: the row is `w-fit mx-auto max-w-full`, NOT justify-between/justify-center on a full
 * -width flex. With a handful of stories, between-spacing stretches bubbles absurdly far apart and
 * plain centering looks fine — until the row overflows, where `justify-center` + overflow clips
 * the FIRST bubbles unreachably off the start edge. A content-width centered box does both right:
 * a balanced cluster when few, a normal start-anchored scroll when many.
 */
export function Stories() {
  const { t, locale } = useI18n();
  const { status } = useAuth();
  const [feed, setFeed] = useState<StorySummary[] | null>(null); // null = still loading
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    // Wait for the boot session restore: likedByMe is only computed for an authenticated call,
    // and fetching as a guest first would flash unliked hearts at a signed-in visitor.
    if (status === "loading") return;
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
        // Fail soft: resolve to "no stories" and the section disappears.
        if (!cancelled) setFeed([]);
      });
    return () => {
      cancelled = true;
    };
  }, [locale, status]);

  const closeViewer = () => {
    setViewerIndex(null);
    setSeen(seenStoryIds()); // rings the viewer just watched turn muted
  };

  if (feed !== null && feed.length === 0) return null;

  return (
    <section
      aria-label={t.stories.ariaRow}
      aria-busy={feed === null}
      className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-6"
    >
      <ul className="mx-auto flex w-fit max-w-full gap-4 overflow-x-auto pb-1 sm:gap-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {feed === null
          ? // Skeletons: same ring/label geometry as a real bubble, so the swap is jump-free.
            Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="shrink-0">
                <div className="flex w-[76px] flex-col items-center gap-2 sm:w-[84px]">
                  <span className="rounded-full bg-border/60 p-[2.5px]">
                    <span className="block rounded-full bg-background p-[3px]">
                      <span className="block h-14 w-14 animate-pulse rounded-full bg-border/50 motion-reduce:animate-none sm:h-16 sm:w-16" />
                    </span>
                  </span>
                  <span className="h-3 w-12 animate-pulse rounded-full bg-border/50 motion-reduce:animate-none" />
                </div>
              </li>
            ))
          : feed.map((story, index) => {
              const isSeen = seen.has(story.id);
              return (
                <li key={story.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewerIndex(index)}
                    className="group flex w-[76px] flex-col items-center gap-2 rounded-xl focus-visible:outline-none sm:w-[84px]"
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
                          // Plain <img>: the URL is a presigned S3 GET that changes every request
                          // and expires — next/image optimization would cache dead links and needs
                          // remotePatterns churn for zero benefit.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={story.thumbnailUrl}
                            alt=""
                            className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
                            loading="lazy"
                            draggable={false}
                          />
                        ) : (
                          <span className="block h-14 w-14 rounded-full bg-gradient-to-br from-brand/25 to-gold/20 sm:h-16 sm:w-16" />
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

      {viewerIndex !== null && feed !== null && (
        <StoryViewer stories={feed} startIndex={viewerIndex} onClose={closeViewer} />
      )}
    </section>
  );
}
