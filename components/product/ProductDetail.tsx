"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getProduct } from "@/lib/products";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { useFly } from "@/components/fx/FlyProvider";
import { useI18n } from "@/components/i18n/language-provider";
import { BnplOptions } from "@/components/cart/BnplOptions";
import { colorOptions, bundleOptions } from "@/lib/product-detail";
import { formatInt } from "@/lib/format";
import {
  BagIcon,
  CheckIcon,
  HeartIcon,
  RentIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";

const IMG = "/mock/product-hero.jpg";

export function ProductDetail({ productId }: { productId: string }) {
  const { t } = useI18n();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { fly } = useFly();
  const router = useRouter();

  const product = getProduct(productId);

  const [color, setColor] = useState(colorOptions[0].id);
  const [bundle, setBundle] = useState(bundleOptions[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (!product) return null;

  const { id, name, category } = product;
  const saved = has(id);
  const filled = Math.round(product.rating);
  const selectedBundle = bundleOptions.find((b) => b.id === bundle);
  const extra = selectedBundle?.extra ?? 0;
  const unit = product.price + extra;

  function add(openDrawer: boolean) {
    // The bundle changes the unit price, so it must be part of the line
    // identity — otherwise the cart would merge different configurations and
    // keep a stale price. The cart resolves product detail from the base id.
    const isBase = bundle === "standard";
    const lineId = isBase ? id : `${id}::${bundle}`;
    const lineName = isBase ? name : `${name} · ${selectedBundle?.label}`;
    addItem(
      { id: lineId, name: lineName, price: unit, category },
      { openDrawer, qty },
    );
  }

  function onAdd(e: React.MouseEvent<HTMLButtonElement>) {
    add(false);
    fly(e.currentTarget, "cart");
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1600);
  }

  function onBuyNow() {
    add(false);
    router.push("/cart");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-2">
          <Image
            src={IMG}
            alt={product.name}
            fill
            priority
            quality={90}
            sizes="(min-width:1024px) 40vw, 100vw"
            className="object-cover"
          />
          {product.bestseller && (
            <span className="absolute start-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-warn shadow-sm backdrop-blur-sm dark:bg-black/75 dark:text-gold">
              {t.deals.bestseller}
            </span>
          )}
          <span className="absolute end-4 top-4 inline-flex items-center rounded-full bg-gold px-3 py-1 text-xs font-bold text-brand-deep shadow-sm">
            -{product.discount}%
          </span>
        </div>
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImg(i)}
              aria-label={`${product.name} — ${i + 1}`}
              aria-pressed={activeImg === i}
              className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeImg === i ? "border-brand" : "border-border hover:border-border-strong"
              }`}
            >
              <Image src={IMG} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Buy box */}
      <div className="flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-wider text-warn dark:text-gold">
          {product.category}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {product.name}
        </h1>

        {/* Rating */}
        <a href="#reviews" className="mt-2 inline-flex w-fit items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${i < filled ? "text-gold" : "text-border-strong"}`}
              />
            ))}
          </span>
          <span className="text-sm font-semibold text-foreground">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-sm text-muted underline-offset-2 hover:underline">
            {formatInt(product.reviews)} {t.cart.reviews}
          </span>
        </a>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            ${formatInt(unit)}
          </span>
          <span className="text-lg text-muted line-through">
            ${formatInt(product.oldPrice + extra)}
          </span>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-icon">
            -{product.discount}%
          </span>
        </div>

        <p className="mt-4 text-muted">{product.description}</p>

        {/* Highlights */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-icon"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Color */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-foreground">
            {t.pdp.color}:{" "}
            <span className="font-normal text-muted">
              {colorOptions.find((c) => c.id === color)?.label}
            </span>
          </p>
          <div className="mt-2 flex gap-2.5">
            {colorOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                aria-label={c.label}
                aria-pressed={color === c.id}
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  color === c.id ? "border-brand" : "border-border"
                }`}
              >
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: c.hex }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="mt-5">
          <p className="text-sm font-semibold text-foreground">
            {t.pdp.configuration}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {bundleOptions.map((bnd) => (
              <button
                key={bnd.id}
                type="button"
                onClick={() => setBundle(bnd.id)}
                aria-pressed={bundle === bnd.id}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  bundle === bnd.id
                    ? "border-brand bg-brand-soft text-brand-icon"
                    : "border-border text-foreground hover:border-border-strong"
                }`}
              >
                {bnd.label}
                {bnd.extra ? ` +$${bnd.extra}` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Qty + CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label={t.cart.decrease}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true">−</span>
            </button>
            <span className="min-w-8 text-center font-medium tabular-nums text-foreground">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label={t.cart.increase}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {added ? (
              <>
                <CheckIcon className="buyo-pop h-5 w-5" />
                {t.cart.added}
              </>
            ) : (
              <>
                <BagIcon className="h-5 w-5" />
                {t.deals.addToCart}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              const willAdd = !saved;
              toggle(id);
              if (willAdd) fly(e.currentTarget, "wishlist");
            }}
            aria-label={t.cart.addToWishlist}
            aria-pressed={saved}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              saved ? "text-brand" : "text-muted hover:text-foreground"
            }`}
          >
            <HeartIcon className={`h-5 w-5 ${saved ? "fill-brand text-brand" : ""}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={onBuyNow}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-brand text-sm font-semibold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t.pdp.buyNow}
        </button>

        {/* BNPL */}
        <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
          <BnplOptions total={unit * qty} />
        </div>

        {/* Trust */}
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { icon: TruckIcon, label: t.pdp.freeDelivery, sub: t.pdp.deliveryNote },
            { icon: ShieldCheckIcon, label: t.pdp.warranty, sub: t.pdp.secure },
            { icon: RentIcon, label: t.pdp.returns, sub: "" },
            { icon: CheckIcon, label: t.pdp.inStock, sub: "" },
          ].map(({ icon: Icon, label, sub }) => (
            <li key={label} className="flex items-center gap-2.5">
              <Icon className="h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{label}</p>
                {sub && <p className="text-xs text-muted">{sub}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
