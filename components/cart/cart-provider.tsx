"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  category: string;
  qty: number;
};

type AddInput = Omit<CartLine, "qty">;

type CartValue = {
  items: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (product: AddInput, opts?: { openDrawer?: boolean }) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartValue | null>(null);

/** In-memory cart (UI-only demo). Adding an item opens the drawer. */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (product: AddInput, opts?: { openDrawer?: boolean }) => {
      setItems((prev) => {
        const idx = prev.findIndex((l) => l.id === product.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
          return next;
        }
        return [...prev, { ...product, qty: 1 }];
      });
      if (opts?.openDrawer !== false) setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback(
    (id: string) => setItems((prev) => prev.filter((l) => l.id !== id)),
    [],
  );

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((l) => l.id !== id)
        : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
    );
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartValue>(() => {
    const count = items.reduce((n, l) => n + l.qty, 0);
    const subtotal = items.reduce((n, l) => n + l.price * l.qty, 0);
    return { items, count, subtotal, isOpen, addItem, removeItem, setQty, open, close };
  }, [items, isOpen, addItem, removeItem, setQty, open, close]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
