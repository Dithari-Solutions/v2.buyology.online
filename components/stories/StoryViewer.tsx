"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { markStorySeen, recordStoryView, setStoryLiked, type StorySummary } from "@/lib/story-feed";
import { useAuth } from "@/components/auth/auth-provider";
import Link from "next/link";
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon } from "@/components/icons";

const IMAGE_DURATION_MS = 6000;

/**
 * Fullscreen story viewer — an overlay, not a route, because the site is single-locale-path and
 * every other modal here (SearchModal, CartDrawer) opens from state.
 *
 * z-[130]: above the chat launcher (120) on purpose — a floating chat bubble over a fullscreen
 * story reads as broken — and below the PasswordGate (200), which must cover everything.
 *
 * Media is rendered with plain <img>/<video>, deliberately not next/image: the URLs are presigned
 * S3 GETs that differ on every request and expire in 2 hours, so optimization caching is useless
 * and images.remotePatterns would need churn for no gain.
 *
 * Images auto-advance on a timer; video advances on its own `ended` event and drives the progress
 * bar from `timeupdate` — the two are intentionally separate mechanisms, because holding to pause
 * pauses the video element itself, not a shared timer.
 */
export function StoryViewer({
  stories,
  startIndex,
  onClose,
}: {
  stories: StorySummary[];
  startIndex: number;
  onClose: () => void;
}) {
  const { t, dir } = useI18n();
  const { status } = useAuth();
  const [storyIndex, setStoryIndex] = useState(startIndex);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 within the current media item
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [signInHint, setSignInHint] = useState(false);
  // Local like overrides so a like sticks while navigating between stories in this session.
  const [likes, setLikes] = useState<Record<string, { liked: boolean; count: number }>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  const story = stories[storyIndex];
  const media = story?.media[mediaIndex];

  // ── view + seen, once per story per viewer session ──
  useEffect(() => {
    if (!story || viewedRef.current.has(story.id)) return;
    viewedRef.current.add(story.id);
    // "Viewed" means "opened", matching how the old site counted; the backend dedupes anyway.
    recordStoryView(story.id);
    markStorySeen(story.id);
  }, [story]);

  // ── navigation ──
  const goNextStory = useCallback(() => {
    if (storyIndex + 1 < stories.length) {
      setStoryIndex((i) => i + 1);
      setMediaIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyIndex, stories.length, onClose]);

  const goNext = useCallback(() => {
    if (story && mediaIndex + 1 < story.media.length) {
      setMediaIndex((i) => i + 1);
      setProgress(0);
    } else {
      goNextStory();
    }
  }, [story, mediaIndex, goNextStory]);

  const goPrev = useCallback(() => {
    if (mediaIndex > 0) {
      setMediaIndex((i) => i - 1);
      setProgress(0);
    } else if (storyIndex > 0) {
      const prev = stories[storyIndex - 1];
      setStoryIndex((i) => i - 1);
      setMediaIndex(Math.max(0, prev.media.length - 1));
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [mediaIndex, storyIndex, stories]);

  // ── image timer (videos drive progress themselves via timeupdate/ended) ──
  useEffect(() => {
    if (!media || media.mediaType !== "IMAGE" || paused) return;
    const startedAt = Date.now();
    const startProgress = progress;
    const timer = setInterval(() => {
      const next = startProgress + (Date.now() - startedAt) / IMAGE_DURATION_MS;
      if (next >= 1) {
        clearInterval(timer);
        goNext();
      } else {
        setProgress(next);
      }
    }, 50);
    return () => clearInterval(timer);
    // progress deliberately not a dep: it would restart the interval on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media, paused, goNext]);

  // ── video pause/resume follows the hold state ──
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, media]);

  // ── preload the next image so advancing never shows a blank frame ──
  useEffect(() => {
    if (!story) return;
    const next = story.media[mediaIndex + 1] ?? stories[storyIndex + 1]?.media[0];
    if (next?.mediaType === "IMAGE") {
      const img = new Image();
      img.src = next.url;
    }
  }, [story, stories, storyIndex, mediaIndex]);

  // ── overlay plumbing: scroll lock, Esc, arrows (physical direction, like the tap zones) ──
  useEffect(() => {
    const unlock = lockBodyScroll();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") (dir === "rtl" ? goPrev : goNext)();
      else if (e.key === "ArrowLeft") (dir === "rtl" ? goNext : goPrev)();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      unlock();
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, goNext, goPrev, dir]);

  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdWasLong = useRef(false);
  const startHold = () => {
    holdWasLong.current = false;
    holdTimer.current = setTimeout(() => {
      holdWasLong.current = true;
      setPaused(true);
    }, 200);
  };
  const endHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setPaused(false);
  };

  /** Physical-side tap: in RTL the "forward" side is the left. */
  const tap = (side: "left" | "right") => {
    if (holdWasLong.current) return; // it was a hold, not a tap
    const forward = dir === "rtl" ? side === "left" : side === "right";
    (forward ? goNext : goPrev)();
  };

  const likeState = useMemo(() => {
    if (!story) return { liked: false, count: 0 };
    return likes[story.id] ?? { liked: story.likedByMe, count: story.likeCount };
  }, [story, likes]);

  async function toggleLike() {
    if (!story) return;
    if (status !== "authed") {
      // Honest gate: the backend requires a signed-in account to like.
      setSignInHint(true);
      setTimeout(() => setSignInHint(false), 3500);
      return;
    }
    const next = !likeState.liked;
    // Optimistic — revert on failure.
    setLikes((m) => ({
      ...m,
      [story.id]: { liked: next, count: likeState.count + (next ? 1 : -1) },
    }));
    try {
      const result = await setStoryLiked(story.id, next);
      setLikes((m) => ({ ...m, [story.id]: { liked: result.liked, count: result.likeCount } }));
    } catch {
      setLikes((m) => ({ ...m, [story.id]: likeState }));
    }
  }

  if (!story || !media) return null;

  return (
    <div
      className="fixed inset-0 z-[130]"
      role="dialog"
      aria-modal="true"
      aria-label={story.title}
    >
      <div className="buyo-overlay absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Desktop story-to-story chevrons, outside the stage */}
      {storyIndex > 0 && (
        <button
          type="button"
          onClick={() => {
            setStoryIndex((i) => i - 1);
            setMediaIndex(0);
            setProgress(0);
          }}
          aria-label={t.stories.previous}
          className="absolute start-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:block rtl:rotate-180"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
      )}
      {storyIndex + 1 < stories.length && (
        <button
          type="button"
          onClick={goNextStory}
          aria-label={t.stories.next}
          className="absolute end-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:block rtl:rotate-180"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      )}

      {/* Stage */}
      <div className="absolute left-1/2 top-1/2 h-[min(94dvh,820px)] w-[min(94vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10 select-none">
        {/* Media */}
        {media.mediaType === "VIDEO" ? (
          <video
            key={media.url}
            ref={videoRef}
            src={media.url}
            className="h-full w-full object-cover"
            autoPlay
            muted={muted}
            playsInline
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration > 0) setProgress(v.currentTime / v.duration);
            }}
            onEnded={goNext}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={media.url}
            src={media.url}
            alt={story.title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        )}

        {/* Tap zones (physical halves; hold either to pause) */}
        <div className="absolute inset-0 flex" aria-hidden>
          <button
            type="button"
            tabIndex={-1}
            className="h-full w-1/3 cursor-default outline-none"
            onPointerDown={startHold}
            onPointerUp={() => { endHold(); tap("left"); }}
            onPointerLeave={endHold}
          />
          <button
            type="button"
            tabIndex={-1}
            className="h-full flex-1 cursor-default outline-none"
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
          />
          <button
            type="button"
            tabIndex={-1}
            className="h-full w-1/3 cursor-default outline-none"
            onPointerDown={startHold}
            onPointerUp={() => { endHold(); tap("right"); }}
            onPointerLeave={endHold}
          />
        </div>

        {/* Top scrim + progress + header */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent pb-10 pt-3">
          <div className="flex gap-1 px-3" dir="ltr">
            {story.media.map((m, i) => (
              <span key={m.orderIndex} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
                <span
                  className="block h-full bg-white"
                  style={{ width: i < mediaIndex ? "100%" : i === mediaIndex ? `${progress * 100}%` : "0%" }}
                />
              </span>
            ))}
          </div>
          <div className="pointer-events-auto mt-3 flex items-center gap-2.5 px-3">
            {story.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.thumbnailUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/40" />
            ) : (
              <span className="h-8 w-8 rounded-full bg-gradient-to-br from-brand via-brand-icon to-gold" />
            )}
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{story.title}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.stories.close}
              className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Bottom scrim: description + actions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-10">
          <div className="pointer-events-auto flex items-end justify-between gap-3 px-4 pb-4">
            <div className="min-w-0">
              {signInHint && (
                <Link
                  href="/login?next=/"
                  className="mb-2 block w-fit rounded-full bg-white/15 px-3 py-1 text-xs text-white underline-offset-2 backdrop-blur-sm hover:underline"
                >
                  {t.stories.signInToLike}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              {media.mediaType === "VIDEO" && (
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? t.stories.unmute : t.stories.mute}
                  className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/25"
                >
                  {muted ? t.stories.unmute : t.stories.mute}
                </button>
              )}
              <button
                type="button"
                onClick={toggleLike}
                aria-label={t.stories.likes}
                aria-pressed={likeState.liked}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  likeState.liked
                    ? "bg-white text-brand"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <HeartIcon className={`h-4 w-4 ${likeState.liked ? "fill-current" : ""}`} />
                {likeState.count}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
