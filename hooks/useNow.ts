"use client";

import { useSyncExternalStore } from "react";

/**
 * One interval behind every consumer, and one cached reading per second.
 *
 * `now` is deliberately module-level: React calls getSnapshot several times per render and throws
 * "The result of getSnapshot should be cached" if the value moves between those calls, so the
 * reading is taken on the tick and handed out unchanged until the next one.
 */
let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (timer === undefined) {
    timer = setInterval(() => {
      now = Date.now();
      for (const listener of listeners) listener();
    }, 1000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      if (timer !== undefined) clearInterval(timer);
      timer = undefined;
      now = 0; // so a later mount re-reads the clock instead of resuming from a stale second
    }
  };
}

function getSnapshot(): number {
  if (now === 0) now = Date.now();
  return now;
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * The current epoch milliseconds, re-read once a second, shared across every caller.
 *
 * Returns **0** on the server and on the client's hydrating render, and that is the point: anything
 * derived from the clock differs between those two renders by construction, so rendering it during
 * hydration is a guaranteed mismatch. 0 means "the clock is not running yet" — callers render a
 * stable placeholder for it — and React re-reads the live value immediately after hydration.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
