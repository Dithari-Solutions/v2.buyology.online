"use client";

import { useI18n } from "@/components/i18n/language-provider";
import { RATING_OPTIONS, type Filters } from "@/lib/shop";
import { PriceRange } from "@/components/products/PriceRange";
import { StarIcon } from "@/components/icons";

const checkbox =
  "h-4 w-4 rounded border-border accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProductFilters({
  categories,
  priceCeil,
  filters,
  onChange,
}: {
  /** The real category list (GET /api/category) — ids drive the server filter, names label it. */
  categories: { id: string; name: string }[];
  /** Upper bound of the slider scale, derived from the priciest product seen. */
  priceCeil: number;
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const { t } = useI18n();

  const toggleCategory = (id: string) =>
    onChange({
      ...filters,
      categories: filters.categories.includes(id)
        ? filters.categories.filter((x) => x !== id)
        : [...filters.categories, id],
    });

  return (
    <div className="space-y-6">
      {/* Category */}
      <fieldset>
        <legend className="mb-2.5 text-sm font-semibold text-foreground">
          {t.shop.category}
        </legend>
        <div className="max-h-52 space-y-2 overflow-y-auto pe-1">
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-muted"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(c.id)}
                onChange={() => toggleCategory(c.id)}
                className={checkbox}
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Price range */}
      <fieldset className="border-t border-border pt-5">
        <legend className="mb-2.5 text-sm font-semibold text-foreground">
          {t.shop.price}
        </legend>
        <PriceRange
          min={0}
          max={priceCeil}
          step={10}
          value={[filters.priceMin ?? 0, filters.priceMax ?? priceCeil]}
          onChange={([lo, hi]) =>
            onChange({
              ...filters,
              // A thumb resting on its end of the scale means "unbounded on that side" — the
              // server then never excludes items that arrive priced beyond the current scale.
              priceMin: lo <= 0 ? null : lo,
              priceMax: hi >= priceCeil ? null : hi,
            })
          }
        />
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
