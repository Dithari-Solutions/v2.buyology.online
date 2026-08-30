"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { fetchAnnouncementCount } from "@/lib/news-api";

/** When this visitor last opened the announcements list. */
const SEEN_KEY = "buyo_news_seen_at";

function readSeen(): string | null {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    // Private mode, or storage blocked. No stored timestamp means everything reads as new,
    // which is the right way round: better a badge that over-counts than one that never shows.
    return null;
  }
}

/**
 * How many announcements this visitor has not opened yet.
 *
 * Kept per-browser rather than per-account on purpose. Announcements are broadcast, not personal,
 * and most of the people reading them are signed out — a server-side "seen" record would need an
 * account the audience does not have, and would cost a row per visitor for a number.
 *
 * Visiting the list marks everything read: the list IS the thing the badge points at, so anything
 * else would leave it lit after the visitor had plainly seen them.
 */
export function AnnouncementsBadge() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  // Derived, not stored. Setting state synchronously in an effect to hide the badge on /news
  // triggers a cascading render — and "am I on the announcements page" is a fact about the
  // current path, which render can simply read.
  const onAnnouncements = pathname === "/news" || pathname.startsWith("/news/");

  useEffect(() => {
    // The list IS what the badge points at, so opening it marks everything read.
    if (!onAnnouncements) return;
    try {
      localStorage.setItem(SEEN_KEY, new Date().toISOString());
    } catch {
      /* nothing to persist to; the badge simply keeps showing */
    }
  }, [onAnnouncements]);

  useEffect(() => {
    if (onAnnouncements) return;
    let cancelled = false;
    fetchAnnouncementCount(readSeen())
      .then((n) => {
        if (!cancelled) setCount(n);
      })
      .catch(() => {
        /* no badge is the right answer when we cannot tell */
      });
    return () => {
      cancelled = true;
    };
  }, [onAnnouncements]);

  if (onAnnouncements || count <= 0) return null;

  return (
    <span className="ms-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-primary-fg">
      {/* Read out as "Announcements, 3 new" rather than a bare number floating after the label. */}
      <span className="sr-only">, </span>
      {count > 9 ? "9+" : count}
      <span className="sr-only"> new</span>
    </span>
  );
}
