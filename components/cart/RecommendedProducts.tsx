"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/products";
import { fetchPopularFor, fetchSuperDeals } from "@/lib/catalogue";
import { useCart } from "@/components/cart/cart-provider";
import { useFly } from "@/components/fx/FlyProvider";
import { useI18n } from "@/components/i18n/language-provider";
import { BotIcon, CheckIcon, SparklesIcon } from "@/components/icons";

const IMG = "/mock/product-hero.jpg";

function RecCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const { addItem } = useCart();
  const { fly } = useFly();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function add(e: React.MouseEvent<HTMLButtonElement>) {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      },
      { openDrawer: false },
    );
    fly(e.currentTarget, "cart", { open: false });
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-elevation)] transition-transform duration-300 hover:-translate-y-0.5">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-2">
        <Image
          src={IMG}
          alt=""
          fill
          sizes="220px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          <SparklesIcon className="h-3 w-3 text-gold" />
          {t.ai.pick}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-warn dark:text-gold">
        {product.category}
      </p>
      <Link
        href={product.href}
        className="mt-0.5 line-clamp-1 text-sm font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {product.name}
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-base font-bold text-foreground">
          ${product.price.toLocaleString()}
        </span>
        <button
          type="button"
          onClick={add}
          aria-label={`${added ? t.cart.added : t.deals.addToCart}: ${product.name}`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            added
              ? "bg-primary text-primary-fg"
              : "bg-surface-2 text-brand-icon hover:bg-primary hover:text-primary-fg"
          }`}
        >
          {added ? (
            <CheckIcon className="buyo-pop h-4 w-4" />
          ) : (
            <span className="text-lg leading-none" aria-hidden="true">
              +
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/** AI-recommended products (Buyobot picks) related to the cart, shown at the
 *  bottom of the cart page. Excludes items already in the cart. */
export function RecommendedProducts() {
  const { t } = useI18n();
  const { items } = useCart();
  const { locale } = useI18n();
  const [recs, setRecs] = useState<Product[]>([]);
  const cartIds = items.map((i) => i.id.split("::")[0]);
  const idsKey = [...new Set(cartIds)].sort().join(",");

  useEffect(() => {
    let cancelled = false;
    const ids = idsKey ? idsKey.split(",") : [];
    // Real picks for THIS cart; the deals rail fills in when the cart gives nothing to go on.
    (ids.length > 0 ? fetchPopularFor(locale, ids) : fetchSuperDeals(locale))
      .then(async (rows) => {
        const filtered = rows.filter((p) => !ids.includes(p.id));
        if (filtered.length === 0 && ids.length > 0) {
          const deals = await fetchSuperDeals(locale);
          return deals.filter((p) => !ids.includes(p.id));
        }
        return filtered;
      })
      .then((rows) => {
        if (!cancelled) setRecs(rows.slice(0, 4));
      })
      .catch(() => {
        /* no recommendations — the section stays hidden */
      });
    return () => {
      cancelled = true;
    };
  }, [locale, idsKey]);

  if (recs.length === 0) return null;

  return (
    <section
      aria-labelledby="rec-heading"
      className="mt-10 border-t border-border pt-8"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-deep text-white">
          <BotIcon className="h-5 w-5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="rec-heading" className="text-lg font-semibold text-foreground">
              {t.ai.recommendedTitle}
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warn dark:text-gold">
              <SparklesIcon className="h-3 w-3" />
              {t.ai.eyebrow}
            </span>
          </div>
          <p className="text-sm text-muted">{t.ai.recommendedNote}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {recs.map((p) => (
          <RecCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
