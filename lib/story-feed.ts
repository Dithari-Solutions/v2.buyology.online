import { backendUrl, type ApiEnvelope } from "@/lib/backend";
import type { Locale } from "@/lib/i18n/config";

/**
 * The real, admin-published stories from the Buyology backend — as opposed to the static
 * category/service bubbles in lib/stories.ts, which they appear alongside.
 *
 * Contract notes that shape this module:
 * - Media URLs are presigned S3 GETs, re-signed on every request with a 2-hour TTL. They must be
 *   fetched fresh per page view and NEVER persisted — a stored URL goes dead.
 * - `language` is a required, case-sensitive enum param (EN | AZ | AR); the list silently drops
 *   stories with no translation in that language.
 * - The list endpoint returns 200 with an empty array when there are none — empty is not an error.
 * - View recording works anonymously (the backend dedupes by hashed IP); likes require a signed-in
 *   JWT, which v2 does not have yet, so the UI treats likes as display + a sign-in hint.
 */

export type StoryMediaItem = {
  mediaType: "IMAGE" | "VIDEO";
  url: string;
  /** Always null in practice for story media — only the story-level thumbnail is populated. */
  thumbnailUrl?: string | null;
  orderIndex: number;
};

export type StorySummary = {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  status: string;
  media: StoryMediaItem[];
  viewCount: number;
  likeCount: number;
  likedByMe: boolean;
  displayOrder?: number | null;
};

const LANGUAGE: Record<Locale, "EN" | "AZ" | "AR"> = { en: "EN", az: "AZ", ar: "AR" };

/** Active stories for the locale, newest arrangement first. Throws on network/HTTP failure. */
export async function fetchStories(locale: Locale): Promise<StorySummary[]> {
  const res = await fetch(backendUrl(`/api/story?language=${LANGUAGE[locale]}`), {
    // Presigned URLs differ per call and expire; caching a response caches dead links.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`stories ${res.status}`);
  const body = (await res.json()) as ApiEnvelope<StorySummary[]>;
  return (body.data ?? []).filter((s) => s.media && s.media.length > 0);
}

/**
 * Tells the backend a story was opened. Anonymous-safe (deduped server-side by user or hashed IP);
 * fire-and-forget — a failed view count must never affect the viewer.
 */
export function recordStoryView(storyId: string): void {
  fetch(backendUrl(`/api/story/${storyId}/view`), { method: "POST" }).catch(() => {});
}

// ── Seen-state ────────────────────────────────────────────────────────────────
// Client-side only (the old site had none): drives the ring colour — brand gradient for unseen,
// muted for seen. localStorage keyed by story id; entries older than 30 days are pruned so the
// map cannot grow forever.

const SEEN_KEY = "buyo_stories_seen";
const SEEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function readSeen(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (!raw) return {};
    const map = JSON.parse(raw) as Record<string, number>;
    const cutoff = Date.now() - SEEN_TTL_MS;
    let dirty = false;
    for (const [id, at] of Object.entries(map)) {
      if (typeof at !== "number" || at < cutoff) {
        delete map[id];
        dirty = true;
      }
    }
    if (dirty) localStorage.setItem(SEEN_KEY, JSON.stringify(map));
    return map;
  } catch {
    return {};
  }
}

export function seenStoryIds(): Set<string> {
  return new Set(Object.keys(readSeen()));
}

export function markStorySeen(storyId: string): void {
  try {
    const map = readSeen();
    map[storyId] = Date.now();
    localStorage.setItem(SEEN_KEY, JSON.stringify(map));
  } catch {
    /* private mode etc. — the ring just stays unseen */
  }
}
