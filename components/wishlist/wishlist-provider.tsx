"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type WishlistValue = {
  /** Product ids, newest first. */
  items: string[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistValue | null>(null);

/** In-memory wishlist (UI-only demo), keyed by product id. */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([]);

  const add = useCallback(
    (id: string) =>
      setItems((prev) => (prev.includes(id) ? prev : [id, ...prev])),
    [],
  );
  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((x) => x !== id)),
    [],
  );
  const toggle = useCallback(
    (id: string) =>
      setItems((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev],
      ),
    [],
  );
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<WishlistValue>(
    () => ({
      items,
      count: items.length,
      has: (id: string) => items.includes(id),
      toggle,
      add,
      remove,
      clear,
    }),
    [items, toggle, add, remove, clear],
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
