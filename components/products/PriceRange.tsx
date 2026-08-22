"use client";

import { useI18n } from "@/components/i18n/language-provider";
import { formatMoney } from "@/lib/format";

/**
 * Two-thumb price range built from two overlaid native range inputs — v2 has no UI library,
 * and native inputs keep keyboard support (arrows/Home/End) and RTL mirroring for free.
 * The inputs themselves ignore the pointer; only the thumbs are interactive (see .buyo-range
 * in globals.css), so the two can share one track without fighting over drags.
 */
export function PriceRange({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (next: [number, number]) => void;
}) {
  const { t } = useI18n();
  const [lo, hi] = value;
  const span = Math.max(1, max - min);
  const loPct = ((lo - min) / span) * 100;
  const hiPct = ((max - hi) / span) * 100;
  // When both thumbs sit at the top end, only the upper input's thumb would be hittable —
  // hoist the lower one above it so the range can be reopened.
  const minOnTop = lo > min + span / 2;

  return (
    <div>
      <div className="relative h-9">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-surface-2" />
        {/* Selected span */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ insetInlineStart: `${loPct}%`, insetInlineEnd: `${hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label={t.shop.priceMinAria}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), hi - step);
            onChange([Math.max(min, next), hi]);
          }}
          className={`buyo-range ${minOnTop ? "z-20" : "z-10"}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={t.shop.priceMaxAria}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), lo + step);
            onChange([lo, Math.min(max, next)]);
          }}
          className={`buyo-range ${minOnTop ? "z-10" : "z-20"}`}
        />
      </div>
      {/* The row follows the document direction so in RTL the min label sits under the
          mirrored min thumb; each value is its own LTR run so "AED 500+" never bidi-flips. */}
      <div className="mt-1 flex items-center justify-between text-xs font-medium text-foreground">
        <span dir="ltr">{formatMoney(lo, "AED")}</span>
        <span dir="ltr">
          {formatMoney(hi, "AED")}
          {hi >= max ? "+" : ""}
        </span>
      </div>
    </div>
  );
}
