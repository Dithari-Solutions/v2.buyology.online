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
import { createPortal } from "react-dom";
import { useCart } from "@/components/cart/cart-provider";
import { BagIcon, HeartIcon } from "@/components/icons";

type FlyKind = "cart" | "wishlist";

type Particle = {
  id: number;
  fromX: number;
  fromY: number;
  dx: number;
  dy: number;
  kind: FlyKind;
  open: boolean;
};

type FlyValue = {
  /** Fly a dot from `source` to the header cart/wishlist icon. */
  fly: (
    source: HTMLElement | null | undefined,
    kind: FlyKind,
    opts?: { open?: boolean },
  ) => void;
};

const FlyContext = createContext<FlyValue | null>(null);

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const bumpTimers = new WeakMap<Element, number>();

function bump(el: Element | null) {
  if (!el) return;
  const prev = bumpTimers.get(el);
  if (prev) window.clearTimeout(prev);
  el.classList.remove("buyo-bump");
  void (el as HTMLElement).offsetWidth; // restart the animation
  el.classList.add("buyo-bump");
  const id = window.setTimeout(() => {
    el.classList.remove("buyo-bump");
    bumpTimers.delete(el);
  }, 460);
  bumpTimers.set(el, id);
}

function FlyingDot({ p, onDone }: { p: Particle; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { dx, dy } = p;
    const dist = Math.hypot(dx, dy);
    const arc = -Math.min(200, dist * 0.35 + 60);
    const anim = el.animate(
      [
        {
          transform: "translate(-50%,-50%) translate(0,0) scale(0.4)",
          opacity: 0.3,
          offset: 0,
        },
        {
          transform: "translate(-50%,-50%) translate(0,0) scale(1)",
          opacity: 1,
          offset: 0.12,
        },
        {
          transform: `translate(-50%,-50%) translate(${dx * 0.5}px, ${dy * 0.5 + arc}px) scale(1.05)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(0.25)`,
          opacity: 0.5,
          offset: 1,
        },
      ],
      { duration: 780, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" },
    );
    let done = false;
    anim.onfinish = () => {
      if (done) return;
      done = true;
      doneRef.current();
    };
    return () => {
      done = true;
      anim.cancel();
    };
  }, [p]);

  const isCart = p.kind === "cart";
  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: p.fromX,
        top: p.fromY,
        zIndex: 300,
        // Seed the keyframe offset-0 state so there's no un-centered flash
        // before the animation takes over on the next frame.
        transform: "translate(-50%,-50%) scale(0.4)",
        opacity: 0.3,
      }}
      className={`pointer-events-none flex h-7 w-7 items-center justify-center rounded-full shadow-lg ${
        isCart
          ? "bg-gradient-to-br from-brand to-brand-deep text-white"
          : "bg-gold text-brand-deep"
      }`}
    >
      {isCart ? (
        <BagIcon className="h-4 w-4" />
      ) : (
        <HeartIcon className="h-4 w-4 fill-current" />
      )}
    </div>
  );
}

/** Provides the fly-to-cart / fly-to-wishlist delight animation. */
export function FlyProvider({ children }: { children: React.ReactNode }) {
  const { open } = useCart();
  const [particles, setParticles] = useState<Particle[]>([]);
  const counter = useRef(0);

  const land = useCallback(
    (kind: FlyKind, doOpen: boolean) => {
      bump(document.getElementById(`header-${kind}`));
      if (kind === "cart" && doOpen) open();
    },
    [open],
  );

  const remove = useCallback(
    (id: number) => setParticles((p) => p.filter((x) => x.id !== id)),
    [],
  );

  const fly = useCallback<FlyValue["fly"]>(
    (source, kind, opts) => {
      const doOpen = opts?.open !== false;
      const target = document.getElementById(`header-${kind}`);
      const srcRect = source?.getBoundingClientRect();
      const tgtRect = target?.getBoundingClientRect();
      if (reducedMotion() || !srcRect || !tgtRect || tgtRect.width === 0) {
        land(kind, doOpen);
        return;
      }
      const fromX = srcRect.left + srcRect.width / 2;
      const fromY = srcRect.top + srcRect.height / 2;
      const toX = tgtRect.left + tgtRect.width / 2;
      const toY = tgtRect.top + tgtRect.height / 2;
      setParticles((prev) => [
        ...prev,
        {
          id: ++counter.current,
          fromX,
          fromY,
          dx: toX - fromX,
          dy: toY - fromY,
          kind,
          open: doOpen,
        },
      ]);
    },
    [land],
  );

  const value = useMemo(() => ({ fly }), [fly]);

  return (
    <FlyContext.Provider value={value}>
      {children}
      {particles.length > 0 &&
        createPortal(
          particles.map((p) => (
            <FlyingDot
              key={p.id}
              p={p}
              onDone={() => {
                land(p.kind, p.open);
                remove(p.id);
              }}
            />
          )),
          document.body,
        )}
    </FlyContext.Provider>
  );
}

export function useFly() {
  const ctx = useContext(FlyContext);
  if (!ctx) throw new Error("useFly must be used within a FlyProvider");
  return ctx;
}
