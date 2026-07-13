"use client";

import { getProduct } from "@/lib/products";
import { useI18n } from "@/components/i18n/language-provider";
import { getSpecValues } from "@/lib/product-detail";

export function ProductSpecs({ productId }: { productId: string }) {
  const { t } = useI18n();
  const product = getProduct(productId);
  if (!product) return null;
  const v = getSpecValues(product);

  const rows: { label: string; value: string }[] = [
    { label: t.pdp.spec.brand, value: v.brand },
    { label: t.pdp.spec.model, value: v.model },
    { label: t.pdp.spec.category, value: v.category },
    { label: t.pdp.spec.rating, value: v.rating },
    { label: t.pdp.spec.warranty, value: v.warranty },
    { label: t.pdp.spec.box, value: v.box },
  ];

  return (
    <section aria-labelledby="specs-heading">
      <h2
        id="specs-heading"
        className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
      >
        {t.pdp.specifications}
      </h2>
      <dl className="mt-5 overflow-hidden rounded-2xl border border-border">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-4 ${
              i % 2 === 0 ? "bg-surface" : "bg-surface-2"
            }`}
          >
            <dt className="w-full text-sm font-medium text-muted sm:w-48 sm:shrink-0">
              {row.label}
            </dt>
            <dd className="text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
