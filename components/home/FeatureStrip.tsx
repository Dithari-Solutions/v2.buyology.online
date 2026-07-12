import type { ComponentType, SVGProps } from "react";
import {
  BotIcon,
  RentIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@/components/icons";
import { getDict } from "@/lib/i18n/server";
import type { Dict } from "@/lib/i18n/dictionaries";

type FeatureKey = keyof Dict["features"];

const featureIcons: Record<
  FeatureKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  delivery: TruckIcon,
  secure: ShieldCheckIcon,
  returns: RentIcon,
  support: BotIcon,
};

const order: FeatureKey[] = ["delivery", "secure", "returns", "support"];

/**
 * Slim trust strip. Hairline dividers come from a 1px grid gap over a border-
 * coloured background (no boxy cards). Responsive 4-up → 2-up → 1-up.
 */
export async function FeatureStrip() {
  const t = await getDict();

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <ul className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {order.map((key) => {
            const Icon = featureIcons[key];
            const f = t.features[key];
            return (
              <li
                key={key}
                className="flex items-center gap-3.5 bg-surface py-5 sm:px-5 lg:py-6"
              >
                <Icon className="h-6 w-6 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {f.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{f.sub}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
