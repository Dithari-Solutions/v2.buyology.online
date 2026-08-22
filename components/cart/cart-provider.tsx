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
import {
  addCartItem,
  getCart,
  removeCartItem,
  setAllCartSelection,
  setCartItemSelection,
  updateCartItemQuantity,
  type ApiCart,
  type ApiCartItem,
} from "@/lib/cart-api";

export type CartLine = {
  /** Server cart-item id when server-backed; a local composite id otherwise. */
  id: string;
  /** The catalogue product id — what consumers enrich/exclude by. */
  productId: string;
  name: string;
  /** Unit price. Server lines carry the price LOCKED AT ADD TIME by the backend. */
  price: number;
  originalPrice?: number | null;
  category: string;
  qty: number;
  /** Only ticked lines are priced and shipped at checkout. */
  selected: boolean;
  /** Saved-for-later: server-side this is selected=false plus a client marker. */
  saved: boolean;
  origin: "server" | "local";
  /** False for demo lines sitting beside a real server cart — they cannot be ordered. */
  selectable: boolean;
  specs?: string[];
  currency?: string;
  storeId?: string;
  specOptionIds?: string[];
};

type AddInput = {
  id: string;
  name: string;
  price: number;
  category: string;
  storeId?: string;
  currency?: string;
  specOptionIds?: string[];
};

type CartFees = {
  deliveryFee: number | null;
  freeShippingThreshold: number | null;
  qualifiesForFreeShipping: boolean | null;
};

type CartValue = {
  /** Active lines (not saved for later). */
  items: CartLine[];
  savedItems: CartLine[];
  count: number;
  /** Selected, orderable lines only — the backend's own definition of the cart total. */
  subtotal: number;
  selectedCount: number;
  currency?: string;
  /** Server-computed delivery figures; null while guest or unknown. */
  fees: CartFees | null;
  isOpen: boolean;
  syncing: boolean;
  /** False until the first cart state (local or server) has actually loaded. */
  ready: boolean;
  /** Set when a server write failed and the cart was re-synced; cleared by the next success. */
  syncError: boolean;
  addItem: (product: AddInput, opts?: { openDrawer?: boolean; qty?: number }) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  setSelected: (id: string, selected: boolean) => void;
  setAllSelected: (selected: boolean) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  open: () => void;
  close: () => void;
};

const CartContext = createContext<CartValue | null>(null);

const LOCAL_KEY = "buyo_cart_v1";
/** The pristine pre-hydration state. Identity marks renders that must never persist. */
const EMPTY_CART: StoredLine[] = [];
const SAVED_KEY = "buyo_cart_saved_v1";
/** The backend rejects quantities above this with a 400. */
const MAX_QTY = 1000;

type StoredLine = Omit<CartLine, "selectable">;

function readLocal(): StoredLine[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as StoredLine[];
    return Array.isArray(rows) ? rows.filter((l) => l && l.id && l.qty > 0) : [];
  } catch {
    return [];
  }
}

function readSavedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function writeSavedSet(set: Set<string>) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...set]));
  } catch {
    /* private mode etc. */
  }
}

function specLabel(s: { groupName?: string | null; groupCode?: string | null; value?: string | null; unit?: string | null }) {
  const group = s.groupName ?? s.groupCode ?? "";
  const unit = s.unit && s.unit !== "NONE" ? ` ${s.unit}` : "";
  return `${group}: ${s.value ?? ""}${unit}`.trim();
}

function sameSpecs(item: ApiCartItem, specOptionIds: string[] | undefined) {
  const got = new Set((item.selectedSpecs ?? []).map((s) => s.specOptionId));
  const want = specOptionIds ?? [];
  return got.size === want.length && want.every((id) => got.has(id));
}

function mapServerCart(cart: ApiCart, savedSet: Set<string>): StoredLine[] {
  return cart.items.map((it) => ({
    id: it.id,
    productId: it.productId,
    // The cart API carries no product title — rows resolve the display name from the
    // catalogue by productId; the SKU is only the placeholder until that lands.
    name: it.productSku ?? it.productId,
    price: it.unitPrice,
    originalPrice: it.originalUnitPrice ?? null,
    category: "",
    qty: it.quantity,
    selected: it.selected,
    // A line the server says is selected cannot be "saved for later" — reconcile.
    saved: !it.selected && savedSet.has(it.id),
    origin: "server" as const,
    specs: (it.selectedSpecs ?? []).map(specLabel).filter(Boolean),
    currency: cart.currency ?? undefined,
    storeId: it.storeId ?? undefined,
  }));
}

/** What the user did to a just-added line while its POST was still in flight. */
type TmpIntent = { removed?: boolean; qty?: number; selected?: boolean; saved?: boolean };

/**
 * Cart with two modes sharing one consumer API:
 *
 *  - GUEST: lines live in localStorage. The backend has no guest carts at all.
 *  - SIGNED IN: the server cart is the truth (keyed by auth_credentials.id = JWT sub).
 *    Mutations apply optimistically, are SERIALIZED through one queue — parallel adds race
 *    the backend's findOrCreateActiveCart into orphan carts — and the server's response is
 *    adopted when the queue drains, so a burst of clicks never bounces the UI.
 *
 * On sign-in, guest lines that know their storeId are replayed into the server cart as one
 * queued operation, carrying their selection and saved-for-later flags with them; demo lines
 * without a storeId (the mock flash-sales rail) stay local and are not orderable.
 *
 * Save-for-later is the backend's own semantics: an unticked (selected=false) line is not
 * priced, not shipped and SURVIVES checkout. A client-side id set remembers which unticked
 * lines the user parked deliberately, so "saved for later" and "merely unticked" render apart.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const credId = user?.credentialId ?? null;
  const authed = status === "authed" && !!credId;

  const [localLines, setLocalLines] = useState<StoredLine[]>(EMPTY_CART);
  const [serverLines, setServerLines] = useState<StoredLine[]>([]);
  const [fees, setFees] = useState<CartFees | null>(null);
  const [currency, setCurrency] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [ready, setReady] = useState(false);
  const [syncError, setSyncError] = useState(false);

  const savedSetRef = useRef<Set<string>>(new Set());
  const serverLinesRef = useRef<StoredLine[]>([]);
  serverLinesRef.current = serverLines;
  const localLinesRef = useRef<StoredLine[]>([]);
  localLinesRef.current = localLines;

  // ── Guest persistence ──────────────────────────────────────────────────────
  // Only the pristine pre-hydration render carries the EMPTY_CART identity; any state update
  // (hydration or a user mutation batched with it) produces a new array. Gating the write on
  // that identity stops the StrictMode wipe without a flag that could freeze shut.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    savedSetRef.current = readSavedSet();
    setLocalLines((prev) => (prev === EMPTY_CART ? readLocal() : prev));
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (localLines === EMPTY_CART) return;
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(localLines));
    } catch {
      /* ignore */
    }
  }, [localLines]);

  // ── Server plumbing ────────────────────────────────────────────────────────
  // authGen invalidates every in-flight server interaction on sign-out/sign-in.
  const authGenRef = useRef(0);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingRef = useRef(0);
  const lastResRef = useRef<ApiCart | null>(null);
  const failedRef = useRef(false);
  // Quantities whose debounced PATCH has not fired yet — adoption must not clobber them.
  const pendingQtyRef = useRef(new Map<string, number>());
  // Edits made to a tmp- line while its POST is in flight, applied once the real id exists.
  const tmpIntentsRef = useRef(new Map<string, TmpIntent>());

  const adopt = useCallback((cart: ApiCart) => {
    const savedSet = savedSetRef.current;
    let lines = mapServerCart(cart, savedSet);
    // Reconcile the saved-set: drop ids the server no longer has or has re-selected.
    const valid = new Set(lines.filter((l) => l.saved).map((l) => l.id));
    if (valid.size !== savedSet.size) {
      savedSetRef.current = valid;
      writeSavedSet(valid);
    }
    // A debounced quantity that hasn't PATCHed yet outranks the snapshot.
    if (pendingQtyRef.current.size > 0) {
      lines = lines.map((l) => {
        const pending = pendingQtyRef.current.get(l.id);
        return pending != null ? { ...l, qty: pending } : l;
      });
    }
    setServerLines(lines);
    setCurrency(cart.currency ?? undefined);
    setFees({
      deliveryFee: cart.deliveryFee ?? null,
      freeShippingThreshold: cart.freeShippingThreshold ?? null,
      qualifiesForFreeShipping: cart.qualifiesForFreeShipping ?? null,
    });
  }, []);

  const reload = useCallback(async () => {
    if (!credId) return;
    const gen = authGenRef.current;
    try {
      const cart = await getCart(credId);
      if (gen === authGenRef.current) adopt(cart);
    } catch {
      /* keep what we have; next mutation retries */
    } finally {
      if (gen === authGenRef.current) setReady(true);
    }
  }, [credId, adopt]);

  const enqueue = useCallback(
    (op: () => Promise<ApiCart | null>) => {
      const gen = authGenRef.current;
      pendingRef.current += 1;
      setSyncing(true);
      queueRef.current = queueRef.current
        .then(async () => {
          if (gen !== authGenRef.current) return;
          const res = await op();
          if (res && gen === authGenRef.current) {
            lastResRef.current = res;
            setSyncError(false);
          }
        })
        .catch(() => {
          if (gen === authGenRef.current) failedRef.current = true;
        })
        .finally(() => {
          pendingRef.current -= 1;
          if (pendingRef.current === 0) {
            setSyncing(false);
            const stale = gen !== authGenRef.current;
            const failed = failedRef.current;
            const res = lastResRef.current;
            failedRef.current = false;
            lastResRef.current = null;
            if (stale) return;
            if (failed) {
              setSyncError(true);
              void reload();
            } else if (res) {
              adopt(res);
            }
          }
        });
    },
    [adopt, reload],
  );

  // ── Sign-in: replay guest lines (one queued op, flags preserved), then load the
  //    server cart. Sign-out: drop server state, fall back to the stored local cart. ──
  const replayedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!authed || !credId) {
      if (status === "guest") {
        authGenRef.current += 1;
        lastResRef.current = null;
        failedRef.current = false;
        pendingQtyRef.current.clear();
        tmpIntentsRef.current.clear();
        setServerLines([]);
        setFees(null);
        setCurrency(undefined);
        setSyncError(false);
        replayedForRef.current = null;
      }
      return;
    }
    if (replayedForRef.current === credId) return;
    replayedForRef.current = credId;
    setReady(false);
    const gen = ++authGenRef.current;
    enqueue(async () => {
      // Snapshot; lines leave localStorage only after the server has accepted them.
      const replayable = localLinesRef.current.filter((l) => l.storeId);
      const pushed: string[] = [];
      for (const line of replayable) {
        if (gen !== authGenRef.current) break;
        try {
          const cart = await addCartItem(credId, {
            storeId: line.storeId!,
            productId: line.productId,
            specOptionIds: line.specOptionIds?.length ? line.specOptionIds : undefined,
            quantity: Math.min(MAX_QTY, line.qty),
          });
          pushed.push(line.id);
          // New server lines arrive ticked; carry the guest's unticked/saved state over.
          if (!line.selected || line.saved) {
            const added = cart.items.find(
              (it) => it.productId === line.productId && sameSpecs(it, line.specOptionIds),
            );
            if (added) {
              await setCartItemSelection(credId, added.id, false);
              if (line.saved) {
                savedSetRef.current.add(added.id);
                writeSavedSet(savedSetRef.current);
              }
            }
          }
        } catch {
          /* the line stays local; nothing is lost */
        }
      }
      // Even if the user signed out mid-replay: these lines are IN the server cart now, so
      // leaving them local would double their quantities on the next sign-in.
      if (pushed.length > 0) {
        setLocalLines((prev) => prev.filter((l) => !pushed.includes(l.id)));
      }
      const cart = await getCart(credId);
      if (gen === authGenRef.current) setReady(true);
      return cart;
    });
  }, [authed, credId, status, enqueue]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (product: AddInput, opts?: { openDrawer?: boolean; qty?: number }) => {
      const add = Math.max(1, Math.min(MAX_QTY, opts?.qty ?? 1));
      const specIds = product.specOptionIds ?? [];

      if (authed && credId && product.storeId) {
        const storeId = product.storeId;
        // The backend merges a spec-less add into the existing product line REGARDLESS of its
        // selected flag — adding a product parked in saved-for-later must pull it back into
        // the active cart, or the add silently disappears into the hidden saved row.
        const match = specIds.length === 0
          ? serverLinesRef.current.find(
              (l) =>
                l.productId === product.id &&
                (l.specs?.length ?? 0) === 0 &&
                !(l.specOptionIds?.length),
            )
          : undefined;
        if (match) {
          const wasParked = match.saved || !match.selected;
          if (wasParked) {
            savedSetRef.current.delete(match.id);
            writeSavedSet(savedSetRef.current);
          }
          setServerLines((prev) =>
            prev.map((l) =>
              l.id === match.id
                ? { ...l, qty: Math.min(MAX_QTY, l.qty + add), selected: true, saved: false }
                : l,
            ),
          );
          if (match.id.startsWith("tmp-")) {
            // The original POST is still in flight; its intent handler PATCHes the final
            // quantity, so a second POST here would double-count the add.
            const intent = tmpIntentsRef.current.get(match.id) ?? {};
            intent.qty = Math.min(MAX_QTY, (intent.qty ?? match.qty) + add);
            intent.selected = true;
            intent.saved = false;
            tmpIntentsRef.current.set(match.id, intent);
          } else {
            const matchId = match.id;
            enqueue(async () => {
              const cart = await addCartItem(credId, {
                storeId,
                productId: product.id,
                quantity: add,
              });
              return wasParked ? setCartItemSelection(credId, matchId, true) : cart;
            });
          }
        } else {
          const tmpId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          setServerLines((prev) => [
            ...prev,
            {
              id: tmpId,
              productId: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              qty: add,
              selected: true,
              saved: false,
              origin: "server" as const,
              specs: [],
              currency: product.currency ?? currency,
              specOptionIds: specIds.length ? specIds : undefined,
            },
          ]);
          enqueue(async () => {
            let cart = await addCartItem(credId, {
              storeId,
              productId: product.id,
              specOptionIds: specIds.length ? specIds : undefined,
              quantity: add,
            });
            // Apply whatever happened to the tmp line while the POST was in flight.
            const intent = tmpIntentsRef.current.get(tmpId);
            tmpIntentsRef.current.delete(tmpId);
            if (intent) {
              const real = cart.items.find(
                (it) => it.productId === product.id && sameSpecs(it, specIds.length ? specIds : undefined),
              );
              if (real) {
                if (intent.removed) {
                  cart = (await removeCartItem(credId, real.id)) ?? cart;
                } else {
                  if (intent.qty != null && intent.qty !== real.quantity) {
                    cart = await updateCartItemQuantity(credId, real.id, intent.qty);
                  }
                  if (intent.saved || intent.selected === false) {
                    cart = await setCartItemSelection(credId, real.id, false);
                    if (intent.saved) {
                      savedSetRef.current.add(real.id);
                      writeSavedSet(savedSetRef.current);
                    }
                  }
                }
              }
            }
            return cart;
          });
        }
      } else {
        // Guest — or a demo item with no real store behind it: stays local either way.
        const lineId = specIds.length ? `${product.id}::${specIds.join(".")}` : product.id;
        setLocalLines((prev) => {
          const idx = prev.findIndex((l) => l.id === lineId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              qty: Math.min(MAX_QTY, next[idx].qty + add),
              selected: true,
              saved: false,
            };
            return next;
          }
          return [
            ...prev,
            {
              id: lineId,
              productId: product.id,
              name: product.name,
              price: product.price,
              category: product.category,
              qty: add,
              selected: true,
              saved: false,
              origin: "local" as const,
              currency: product.currency,
              storeId: product.storeId,
              specOptionIds: specIds.length ? specIds : undefined,
            },
          ];
        });
      }
      if (opts?.openDrawer !== false) setIsOpen(true);
    },
    [authed, credId, currency, enqueue],
  );

  const qtyTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const timers = qtyTimersRef.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const removeItem = useCallback(
    (id: string) => {
      const server = serverLinesRef.current.find((l) => l.id === id);
      if (server && authed && credId) {
        setServerLines((prev) => prev.filter((l) => l.id !== id));
        const timer = qtyTimersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          qtyTimersRef.current.delete(id);
        }
        pendingQtyRef.current.delete(id);
        if (id.startsWith("tmp-")) {
          // The POST is still in flight — its queued op deletes the real line on arrival.
          tmpIntentsRef.current.set(id, { ...(tmpIntentsRef.current.get(id) ?? {}), removed: true });
        } else {
          enqueue(() => removeCartItem(credId, id));
        }
      } else {
        setLocalLines((prev) => prev.filter((l) => l.id !== id));
      }
    },
    [authed, credId, enqueue],
  );

  // One PATCH per click-burst: firing one per click lets responses land out of order and
  // bounce the displayed number.
  const setQty = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) {
        removeItem(id);
        return;
      }
      qty = Math.min(MAX_QTY, qty);
      const server = serverLinesRef.current.find((l) => l.id === id);
      if (server && authed && credId) {
        setServerLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)));
        if (id.startsWith("tmp-")) {
          tmpIntentsRef.current.set(id, { ...(tmpIntentsRef.current.get(id) ?? {}), qty });
          return;
        }
        pendingQtyRef.current.set(id, qty);
        const timers = qtyTimersRef.current;
        const existing = timers.get(id);
        if (existing) clearTimeout(existing);
        timers.set(
          id,
          setTimeout(() => {
            timers.delete(id);
            const target = pendingQtyRef.current.get(id);
            if (target == null) return; // removed inside the debounce window
            enqueue(async () => {
              try {
                return await updateCartItemQuantity(credId, id, target);
              } finally {
                // Clear on success AND failure (unless a newer quantity superseded this one) —
                // a surviving entry would pin the stale number over every future snapshot.
                if (pendingQtyRef.current.get(id) === target) pendingQtyRef.current.delete(id);
              }
            });
          }, 450),
        );
      } else {
        setLocalLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)));
      }
    },
    [authed, credId, enqueue, removeItem],
  );

  const applySelection = useCallback(
    (id: string, selected: boolean, saved: boolean) => {
      const server = serverLinesRef.current.find((l) => l.id === id);
      if (server && authed && credId) {
        setServerLines((prev) =>
          prev.map((l) => (l.id === id ? { ...l, selected, saved } : l)),
        );
        if (id.startsWith("tmp-")) {
          // Recorded against the real id once the POST lands — never store tmp ids.
          tmpIntentsRef.current.set(id, {
            ...(tmpIntentsRef.current.get(id) ?? {}),
            selected,
            saved,
          });
          return;
        }
        const set = savedSetRef.current;
        if (saved) set.add(id);
        else set.delete(id);
        writeSavedSet(set);
        enqueue(() => setCartItemSelection(credId, id, selected));
      } else {
        setLocalLines((prev) =>
          prev.map((l) => (l.id === id ? { ...l, selected, saved } : l)),
        );
      }
    },
    [authed, credId, enqueue],
  );

  const setSelected = useCallback(
    (id: string, selected: boolean) => applySelection(id, selected, false),
    [applySelection],
  );
  const saveForLater = useCallback(
    (id: string) => applySelection(id, false, true),
    [applySelection],
  );
  const moveToCart = useCallback(
    (id: string) => applySelection(id, true, false),
    [applySelection],
  );

  const setAllSelected = useCallback(
    (selected: boolean) => {
      if (!authed) {
        setLocalLines((prev) => prev.map((l) => (l.saved ? l : { ...l, selected })));
        return;
      }
      if (!credId) return;
      const lines = serverLinesRef.current;
      const saved = lines.filter((l) => l.saved);
      setServerLines((prev) => prev.map((l) => (l.saved ? l : { ...l, selected })));
      // In-flight adds are reached through their intents, not a PATCH on a tmp id.
      for (const line of lines) {
        if (line.id.startsWith("tmp-") && !line.saved) {
          tmpIntentsRef.current.set(line.id, {
            ...(tmpIntentsRef.current.get(line.id) ?? {}),
            selected,
            saved: false,
          });
        }
      }
      if (selected && saved.length > 0) {
        // The bulk endpoint would also pull saved-for-later lines back into the order —
        // tick only the active ones, line by line.
        for (const line of lines) {
          if (!line.saved && !line.selected && !line.id.startsWith("tmp-")) {
            const id = line.id;
            enqueue(() => setCartItemSelection(credId, id, true));
          }
        }
      } else {
        // Deselect-all via bulk is safe: saved lines are already unticked.
        enqueue(() => setAllCartSelection(credId, selected));
      }
    },
    [authed, credId, enqueue],
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartValue>(() => {
    // Demo lines (no real store) beside a server cart cannot be ordered and must not
    // pollute the AED subtotal with mock "$" prices.
    const all: CartLine[] = [
      ...(authed ? serverLines.map((l) => ({ ...l, selectable: true })) : []),
      ...localLines.map((l) => ({
        ...l,
        selectable: !authed,
        selected: authed ? false : l.selected,
      })),
    ];
    const items = all.filter((l) => !l.saved);
    const savedItems = all.filter((l) => l.saved);
    const count = items.reduce((n, l) => n + l.qty, 0);
    const selectedLines = items.filter((l) => l.selected && l.selectable);
    const subtotal = selectedLines.reduce((n, l) => n + l.price * l.qty, 0);
    // Guests have no server cart to stamp a currency — the lines themselves know theirs
    // (real catalogue items carry AED; mock demo items carry none and keep the "$" look).
    const displayCurrency =
      currency ?? all.find((l) => l.currency)?.currency ?? undefined;
    return {
      items,
      savedItems,
      count,
      subtotal,
      selectedCount: selectedLines.length,
      currency: displayCurrency,
      fees: authed ? fees : null,
      isOpen,
      syncing,
      // While the session is still restoring ("loading") nothing is known yet — an empty
      // store then must render as a skeleton, never as "your cart is empty".
      ready: status === "authed" ? ready : status === "guest" ? hydrated : false,
      syncError,
      addItem,
      removeItem,
      setQty,
      setSelected,
      setAllSelected,
      saveForLater,
      moveToCart,
      open,
      close,
    };
  }, [
    authed, status, hydrated, serverLines, localLines, currency, fees, isOpen, syncing, ready, syncError,
    addItem, removeItem, setQty, setSelected, setAllSelected, saveForLater, moveToCart, open, close,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
