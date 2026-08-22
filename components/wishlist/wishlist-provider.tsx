"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { addFavorite, getFavorites, removeFavorite } from "@/lib/cart-api";
import { AuthError } from "@/lib/auth/client";

type WishlistValue = {
  /** Product ids, newest first. */
  items: string[];
  count: number;
  /** False until the list (local or server) has actually loaded — skeleton, not "empty". */
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistValue | null>(null);

const LOCAL_KEY = "buyo_wishlist_v1";
/** The pristine pre-hydration state. Identity marks renders that must never persist. */
const EMPTY_WISHLIST: string[] = [];

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(ids) ? ids.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Wishlist backed by the favourites API when signed in (keyed by auth_credentials.id, one
 * favourite per product id), by localStorage as a guest. Hearts flip optimistically; the
 * backend treats duplicate-add (409) and remove-missing (404) as success, so only real
 * failures revert. Local hearts are replayed to the server once at sign-in.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const credId = user?.credentialId ?? null;
  const authed = status === "authed" && !!credId;

  const [items, setItems] = useState<string[]>(EMPTY_WISHLIST);
  const [hydrated, setHydrated] = useState(false);
  const [serverReady, setServerReady] = useState(false);
  const itemsRef = useRef<string[]>([]);
  itemsRef.current = items;
  /** Optimistic ops whose API call hasn't settled — they outrank any fetched snapshot. */
  const pendingRef = useRef(new Map<string, "add" | "remove">());

  // ── Guest persistence ──────────────────────────────────────────────────────
  // Only the pristine pre-hydration render carries the EMPTY_WISHLIST identity; gating the
  // write on it stops the StrictMode wipe without a flag that could freeze shut.
  useEffect(() => {
    setItems((prev) => (prev === EMPTY_WISHLIST ? readLocal() : prev));
    setHydrated(true);
  }, []);
  const authedRef = useRef(false);
  authedRef.current = authed;
  useEffect(() => {
    if (items === EMPTY_WISHLIST) return;
    if (authedRef.current) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  // ── Sign-in: replay local hearts, adopt the server list. Sign-out: back to local. ──
  const genRef = useRef(0);
  const replayedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!authed || !credId) {
      if (status === "guest") {
        genRef.current += 1;
        replayedForRef.current = null;
        setItems(readLocal());
      }
      return;
    }
    if (replayedForRef.current === credId) return;
    replayedForRef.current = credId;
    setServerReady(false);
    const gen = ++genRef.current;
    (async () => {
      const local = readLocal();
      const kept: string[] = [];
      let aborted = false;
      for (const id of local) {
        if (gen !== genRef.current) {
          // Signed out mid-replay: hearts not yet pushed stay local, untouched.
          aborted = true;
          kept.push(id);
          continue;
        }
        try {
          await addFavorite(credId, id); // 409 = already there = fine
        } catch (e) {
          // A vanished product (404) is genuinely gone; anything else (network, 5xx,
          // dead session) keeps the heart locally so nothing is silently lost.
          if (!(e instanceof AuthError && e.status === 404)) kept.push(id);
        }
      }
      try {
        if (kept.length > 0) localStorage.setItem(LOCAL_KEY, JSON.stringify(kept));
        else localStorage.removeItem(LOCAL_KEY);
      } catch {
        /* ignore */
      }
      if (aborted || gen !== genRef.current) return;
      try {
        const favs = await getFavorites(credId);
        if (gen !== genRef.current) return;
        setServerReady(true);
        const sorted = [...favs].sort((a, b) =>
          (b.savedAt ?? "").localeCompare(a.savedAt ?? ""),
        );
        // Hearts toggled while this fetch was in flight outrank the snapshot.
        const server = sorted.map((f) => f.productId);
        const pending = pendingRef.current;
        const merged = [
          ...itemsRef.current.filter((id) => pending.get(id) === "add" && !server.includes(id)),
          ...server.filter((id) => pending.get(id) !== "remove"),
        ];
        setItems(merged);
      } catch {
        /* keep whatever is shown; hearts still work optimistically */
        if (gen === genRef.current) setServerReady(true);
      }
    })();
  }, [authed, credId, status]);

  // ── Mutations (optimistic; revert on real failure) ─────────────────────────
  const add = useCallback(
    (id: string) => {
      setItems((prev) => (prev.includes(id) ? prev : [id, ...prev]));
      if (authed && credId) {
        const gen = genRef.current;
        pendingRef.current.set(id, "add");
        addFavorite(credId, id)
          .catch(() => {
            if (gen === genRef.current)
              setItems((prev) => prev.filter((x) => x !== id));
          })
          .finally(() => {
            if (pendingRef.current.get(id) === "add") pendingRef.current.delete(id);
          });
      }
    },
    [authed, credId],
  );

  const remove = useCallback(
    (id: string) => {
      const present = itemsRef.current.includes(id);
      setItems((prev) => prev.filter((x) => x !== id));
      if (authed && credId && present) {
        const gen = genRef.current;
        pendingRef.current.set(id, "remove");
        removeFavorite(credId, id)
          .catch(() => {
            if (gen === genRef.current)
              setItems((prev) => (prev.includes(id) ? prev : [id, ...prev]));
          })
          .finally(() => {
            if (pendingRef.current.get(id) === "remove") pendingRef.current.delete(id);
          });
      }
    },
    [authed, credId],
  );

  const toggle = useCallback(
    (id: string) => {
      if (itemsRef.current.includes(id)) remove(id);
      else add(id);
    },
    [add, remove],
  );

  const clear = useCallback(() => {
    const cleared = itemsRef.current;
    setItems([]);
    if (authed && credId) {
      // Explicit per-id removes — the /all endpoint exists but per-id keeps revert simple.
      for (const id of cleared) {
        pendingRef.current.set(id, "remove");
        void removeFavorite(credId, id)
          .catch(() => {})
          .finally(() => {
            if (pendingRef.current.get(id) === "remove") pendingRef.current.delete(id);
          });
      }
    }
  }, [authed, credId]);

  const value = useMemo<WishlistValue>(
    () => ({
      items,
      count: items.length,
      ready: authed ? serverReady : status === "guest" ? hydrated : false,
      has: (id: string) => items.includes(id),
      toggle,
      add,
      remove,
      clear,
    }),
    [items, authed, status, hydrated, serverReady, toggle, add, remove, clear],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx)
    throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
