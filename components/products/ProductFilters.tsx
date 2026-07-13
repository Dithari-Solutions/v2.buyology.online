"use client";

import { useI18n } from "@/components/i18n/language-provider";
import { PRICE_BRACKETS, RATING_OPTIONS, type Filters } from "@/lib/shop";
import { StarIcon } from "@/components/icons";

const checkbox =
  "h-4 w-4 rounded border-border accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProductFilters({
  categories,
  filters,
  onChange,
}: {
  categories: string[];
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const { t } = useI18n();

  const toggleCategory = (c: string) =>
    onChange({
      ...filters,
      categories: filters.categories.includes(c)
        ? filters.categories.filter((x) => x !== c)
        : [...filters.categories, c],
    });

  return (
    <div className="space-y-6">
      {/* Category */}
      <fieldset>
        <legend className="mb-2.5 text-sm font-semibold text-foreground">
          {t.shop.category}
        </legend>
        <div className="space-y-2">
          {categories.map((c) => (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(c)}
                onChange={() => toggleCategory(c)}
                className={checkbox}
              />
              {c}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Price */}
      <fieldset className="border-t border-border pt-5">
        <legend className="mb-2.5 text-sm font-semibold text-foreground">
          {t.shop.price}
        </legend>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
            <input
              type="radio"
              name="price"
              checked={filters.price === "any"}
              onChange={() => onChange({ ...filters, price: "any" })}
              className={checkbox}
            />
            {t.shop.anyPrice}
          </label>
          {PRICE_BRACKETS.map((b) => (
            <label
              key={b.key}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted"
            >
              <input
                type="radio"
                name="price"
                checked={filters.price === b.key}
                onChange={() => onChange({ ...filters, price: b.key })}
                className={checkbox}
              />
              {t.shop.brackets[b.key as keyof typeof t.shop.brackets]}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Rating */}
      <fieldset className="border-t border-border pt-5">
        <legend className="mb-2.5 text-sm font-semibold text-foreground">
          {t.shop.rating}
        </legend>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => {
            const on = filters.rating === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ ...filters, rating: on ? 0 : r })}
                aria-pressed={on}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  on
                    ? "border-brand bg-brand-soft text-brand-icon"
                    : "border-border text-muted hover:border-border-strong"
                }`}
              >
                <StarIcon className="h-3.5 w-3.5 text-gold" />
                {r} {t.shop.ratingUp}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Toggles */}
      <div className="space-y-2.5 border-t border-border pt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={(e) => onChange({ ...filters, onSale: e.target.checked })}
            className={checkbox}
          />
          {t.shop.onSale}
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            checked={filters.bestseller}
            onChange={(e) =>
              onChange({ ...filters, bestseller: e.target.checked })
            }
            className={checkbox}
          />
          {t.shop.bestsellers}
        </label>
      </div>
    </div>
  );
}
