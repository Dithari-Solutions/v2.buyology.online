"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { backendUrl } from "@/lib/backend";

/**
 * The visitor beacon behind the dashboard's unique/total visitor metric.
 *
 * The dashboard has shown that metric all along; the new storefront simply never reported to
 * it, so every page view here was invisible. One POST per page view, anonymous.
 *
 * The visitor id is the SAME localStorage key the assistant uses, deliberately: both are meant
 * to identify a browser, and two different ids would make "unique visitors" and the assistant's
 * per-visitor limits disagree about who is who.
 */

/** Shared with lib/assistant/client.ts — one notion of a browser. */
const VISITOR_KEY = "buy_visitor_id";
const SESSION_KEY = "buy_visit_session";

/** Read an id, or mint and persist one. Returns undefined when storage is unavailable. */
function readOrCreateId(store: "localStorage" | "sessionStorage", key: string): string | undefined {
  try {
    const bag = window[store];
    let id = bag.getItem(key);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      bag.setItem(key, id);
    }
    return id.slice(0, 64);
  } catch {
    // Private mode or a blocking cookie policy. The visit still counts; it just cannot be
    // attributed to a returning browser.
    return undefined;
  }
}

/** The referrer only when it came from another site — our own pages are not referrals. */
function externalReferrer(): string | undefined {
  try {
    const ref = document.referrer;
    if (!ref) return undefined;
    return new URL(ref).host === window.location.host ? undefined : ref.slice(0, 512);
  } catch {
    return undefined;
  }
}

export function VisitTracker() {
  const pathname = usePathname();
  /**
   * The last path reported, with when. React's development Strict Mode mounts effects twice, and
   * a re-render can repeat a pathname — without this the same view is counted twice.
   */
  const lastSent = useRef<{ path: string; at: number } | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const previous = lastSent.current;
    if (previous && previous.path === pathname && Date.now() - previous.at < 1000) return;
    lastSent.current = { path: pathname, at: Date.now() };

    fetch(backendUrl("/api/analytics/visit"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: readOrCreateId("localStorage", VISITOR_KEY),
        sessionId: readOrCreateId("sessionStorage", SESSION_KEY),
        path: pathname,
        referrer: externalReferrer(),
        language: document.documentElement.lang || undefined,
      }),
      // Survives the shopper navigating away immediately. Credentials are omitted because the
      // endpoint is anonymous and has no use for the session cookie.
      keepalive: true,
      credentials: "omit",
    }).catch(() => {
      /* a missed count is never worth surfacing to a shopper */
    });
  }, [pathname]);

  return null;
}
