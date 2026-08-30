import { backendUrl } from "@/lib/backend";

/**
 * Announcements — giveaways, launches and service updates.
 *
 * Every read here is public and unauthenticated on purpose: announcements are the one part of
 * the site written for people who have not signed up, so a token requirement would hide them
 * from most of their audience.
 */
export type Announcement = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  /** Rich text from the dashboard editor. Sanitised before it is rendered. */
  content: string;
  status: "DRAFT" | "PUBLISHED";
  imageUrl: string | null;
  galleryUrls: string[];
  publishedAt: string | null;
  createdAt: string;
};

async function readEnvelope<T>(path: string, revalidate: number): Promise<T | null> {
  try {
    const res = await fetch(backendUrl(path), { next: { revalidate } });
    if (!res.ok) return null;
    const envelope = await res.json();
    return (envelope?.data ?? null) as T | null;
  } catch {
    // An unreachable API renders an empty state, never a crash — this page is public and
    // frequently the first thing a visitor from social media sees.
    return null;
  }
}

/** Published announcements, newest first. */
export function fetchAnnouncements(): Promise<Announcement[] | null> {
  return readEnvelope<Announcement[]>("/api/news", 60);
}

/** One announcement by slug. Null when it does not exist or is still a draft. */
export function fetchAnnouncement(slug: string): Promise<Announcement | null> {
  return readEnvelope<Announcement>(`/api/news/${encodeURIComponent(slug)}`, 60);
}

/** How many were published after `since` — drives the header badge. */
export async function fetchAnnouncementCount(since: string | null): Promise<number> {
  const q = since ? `?since=${encodeURIComponent(since)}` : "";
  const data = await readEnvelope<{ count: number }>(`/api/news/count${q}`, 0);
  return data?.count ?? 0;
}
