import type { ComponentType, SVGProps } from "react";
import { BotIcon, GaugeIcon, TruckIcon, UsersIcon } from "@/components/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type Metric = {
  /** i18n key into dictionaries.metrics.items. */
  key: string;
  icon: IconType;
  /** Target value the counter animates up to. */
  to: number;
  /** How the number is formatted. */
  kind: "compact" | "percent";
  /** Static suffix rendered after the number (e.g. "+"). */
  suffix?: string;
};

/** Headline social-proof metrics shown under the Buyology AI section. */
export const metrics: Metric[] = [
  { key: "customers", icon: UsersIcon, to: 2_400_000, kind: "compact", suffix: "+" },
  { key: "orders", icon: TruckIcon, to: 9_800_000, kind: "compact", suffix: "+" },
  { key: "chats", icon: BotIcon, to: 5_100_000, kind: "compact", suffix: "+" },
  { key: "ontime", icon: GaugeIcon, to: 99.2, kind: "percent" },
];

export const REVIEW_SCORE = 4.9;
export const REVIEW_COUNT = 128_400;
/** Share of reviews per star bucket, 5★ → 1★ (percent, sums to 100). */
export const REVIEW_DISTRIBUTION = [88, 9, 2, 1, 0];
