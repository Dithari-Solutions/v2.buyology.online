"use client";

import { useI18n } from "@/components/i18n/language-provider";
import { useProduct } from "@/components/product/product-context";

/**
 * The specification table, from the catalogue's own spec records. A product with no specs shows
 * the identity rows (brand, category, rating) rather than an empty box.
 */
export function ProductSpecs() {
  const { t } = useI18n();
  const { product, api } = useProduct();

  const rows: { label: string; value: string }[] = [];
  if (api.brandName) rows.push({ label: t.pdp.spec.brand, value: api.brandName });
  if (api.sku) rows.push({ label: t.pdp.spec.model, value: api.sku });
  if (product.category) rows.push({ label: t.pdp.spec.category, value: product.category });
  rows.push({
    label: t.pdp.spec.rating,
    value: `${product.rating.toFixed(1)} / 5 (${product.reviews})`,
  });
  for (const spec of api.specs ?? []) {
    const values = (spec.options ?? [])
      .map((o) => [o.value, o.unit].filter(Boolean).join(" "))
      .filter(Boolean);
    if (values.length > 0) {
      rows.push({ label: spec.name ?? spec.code ?? "—", value: values.join(" / ") });
    }
  }

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
            key={row.label + i}
            className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:gap-4 ${
              i % 2 === 0 ? "bg-surface" : "bg-surface-2"
            }`}
          >
            <dt className="w-full break-words text-sm font-medium text-muted sm:w-48 sm:shrink-0">
              {row.label}
            </dt>
            <dd className="break-words text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
