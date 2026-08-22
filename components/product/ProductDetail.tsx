"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { useFly } from "@/components/fx/FlyProvider";
import { useI18n } from "@/components/i18n/language-provider";
import { BnplOptions } from "@/components/cart/BnplOptions";
import { useProduct } from "@/components/product/product-context";
import { formatInt, formatMoney } from "@/lib/format";
import {
  BagIcon,
  CheckIcon,
  HeartIcon,
  RentIcon,
  ShieldCheckIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons";

const FALLBACK_IMG = "/mock/product-hero.jpg";

/**
 * The buy box + gallery, on the real catalogue record shared by the PDP provider.
 *
 * Colour swatches come from the product's own colors array and the configuration chips from its
 * spec options (with their real surcharges). Both adjust the LOCAL cart line only — the cart is
 * still v2's client-side cart until the checkout migration, at which point the selection must be
 * carried into the server cart payload instead.
 */
export function ProductDetail() {
  const { t } = useI18n();
  const { product, api } = useProduct();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { fly } = useFly();
  const router = useRouter();

  const gallery = useMemo(() => {
    const media = [...(api.media ?? [])]
      .filter((m) => m.url)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    return media.length > 0 ? media : null;
  }, [api.media]);

  /** Specs that offer a real choice; single-option specs are information, not configuration. */
  const configurableSpecs = useMemo(
    () => (api.specs ?? []).filter((s) => (s.options?.length ?? 0) > 1),
    [api.specs],
  );

  const colors = api.colors ?? [];
  const [color, setColor] = useState(0);
  const [choice, setChoice] = useState<Record<string, number>>({});
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

  const { id, name, category, currency } = product;
  const saved = has(id);
  const filled = Math.round(product.rating);

  const selectedOptions = configurableSpecs.map((spec) => {
    const idx = choice[spec.id] ?? 0;
    return { spec, option: spec.options![idx] };
  });
  const extra = selectedOptions.reduce((acc, s) => acc + (s.option?.additionalPrice ?? 0), 0);
  const unit = product.price + extra;
  const outOfStock = product.inStock === false;

  function add(openDrawer: boolean) {
    // The configuration changes the unit price, so it is part of the line identity — otherwise
    // the cart would merge different configurations and keep a stale price. The cart resolves
    // rich detail from the base id (before "::").
    const optionIds = selectedOptions.map((s) => s.option?.id).filter(Boolean);
    const isBase = extra === 0 && optionIds.length === 0;
    const suffix = selectedOptions
      .map((s) => [s.option?.value, s.option?.unit].filter(Boolean).join(" "))
      .filter(Boolean)
      .join(" · ");
    addItem(
      {
        id: isBase ? id : `${id}::${optionIds.join(".")}`,
        name: suffix ? `${name} · ${suffix}` : name,
        price: unit,
        category,
      },
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

  const activeUrl = gallery?.[Math.min(activeImg, (gallery?.length ?? 1) - 1)]?.url ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-2">
          {activeUrl ? (
            // Presigned, short-lived URL — plain <img> on purpose.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeUrl}
              alt={product.name}
              className="absolute inset-0 h-full w-full bg-white object-contain p-6"
              draggable={false}
            />
          ) : (
            <Image
              src={FALLBACK_IMG}
              alt={product.name}
              fill
              priority
              quality={90}
              sizes="(min-width:1024px) 40vw, 100vw"
              className="object-cover"
            />
          )}
          {product.bestseller && (
            <span className="absolute start-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-warn shadow-sm backdrop-blur-sm dark:bg-black/75 dark:text-gold">
              {t.deals.bestseller}
            </span>
          )}
          {product.discount > 0 && (
            <span className="absolute end-4 top-4 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-fg shadow-sm">
              -{product.discount}%
            </span>
          )}
        </div>
        {gallery && gallery.length > 1 && (
          <div className="flex gap-3 overflow-x-auto">
            {gallery.map((m, i) => (
              <button
                key={m.url}
                type="button"
                onClick={() => setActiveImg(i)}
                aria-label={`${product.name} — ${i + 1}`}
                aria-pressed={activeImg === i}
                className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  activeImg === i ? "border-brand" : "border-border hover:border-border-strong"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.thumbnailUrl ?? m.url!}
                  alt=""
                  className="absolute inset-0 h-full w-full bg-white object-contain p-1"
                  loading="lazy"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
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
        <div className="mt-4 flex items-baseline gap-3" dir="ltr">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {formatMoney(unit, currency)}
          </span>
          {product.oldPrice > product.price && (
            <>
              <span className="text-lg text-muted line-through">
                {formatMoney(product.oldPrice + extra, currency)}
              </span>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-icon">
                -{product.discount}%
              </span>
            </>
          )}
        </div>

        {product.description && <p className="mt-4 text-muted">{product.description}</p>}

        {/* Highlights */}
        {product.tags.length > 0 && (
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
        )}

        {/* Colour — the catalogue's own swatches; absent product, absent section. */}
        {colors.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-foreground">{t.pdp.color}</p>
            <div className="mt-2 flex gap-2.5">
              {colors.map((hex, i) => (
                <button
                  key={hex + i}
                  type="button"
                  onClick={() => setColor(i)}
                  aria-label={hex}
                  aria-pressed={color === i}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    color === i ? "border-brand" : "border-border"
                  }`}
                >
                  <span className="h-6 w-6 rounded-full" style={{ backgroundColor: hex }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Configuration — real spec options, with their real surcharges. */}
        {configurableSpecs.map((spec) => (
          <div key={spec.id} className="mt-5">
            <p className="text-sm font-semibold text-foreground">{spec.name ?? spec.code}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {spec.options!.map((opt, i) => {
                const on = (choice[spec.id] ?? 0) === i;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setChoice((c) => ({ ...c, [spec.id]: i }))}
                    aria-pressed={on}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      on
                        ? "border-brand bg-brand-soft text-brand-icon"
                        : "border-border text-foreground hover:border-border-strong"
                    }`}
                  >
                    {[opt.value, opt.unit].filter(Boolean).join(" ")}
                    {opt.additionalPrice ? ` +${formatMoney(opt.additionalPrice, currency)}` : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

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
            disabled={outOfStock}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
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
          disabled={outOfStock}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-brand text-sm font-semibold text-brand transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t.pdp.buyNow}
        </button>

        {/* BNPL */}
        <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
          <BnplOptions total={unit * qty} />
        </div>

        {/* Trust — real where the catalogue speaks, generic otherwise. */}
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              icon: TruckIcon,
              label:
                api.freeDelivery
                  ? t.pdp.freeDelivery
                  : api.deliveryFee != null
                    ? `${t.pdp.freeDelivery.split("—")[0] ?? t.pdp.freeDelivery}`
                    : t.pdp.freeDelivery,
              sub: t.pdp.deliveryNote,
            },
            { icon: ShieldCheckIcon, label: t.pdp.warranty, sub: t.pdp.secure },
            { icon: RentIcon, label: t.pdp.returns, sub: "" },
            {
              icon: CheckIcon,
              label: outOfStock ? (t.account.orders.statuses.FAILED ?? t.pdp.inStock) : t.pdp.inStock,
              sub:
                !outOfStock && product.stock != null && product.stock > 0 && product.stock < 5
                  ? `${product.stock}`
                  : "",
            },
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
