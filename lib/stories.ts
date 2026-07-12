import type { ComponentType, SVGProps } from "react";
import {
  BotIcon,
  GamepadIcon,
  HammerIcon,
  HeadphonesIcon,
  HouseIcon,
  RentIcon,
  SparklesIcon,
  TagIcon,
  WatchIcon,
  WrenchIcon,
} from "@/components/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type Story = {
  /** i18n key into dictionaries.items for the label. */
  key: string;
  icon: IconType;
  href: string;
};

/** Instagram-style story bubbles shown directly under the header (UI only). */
export const stories: Story[] = [
  { key: "cat-newin", icon: SparklesIcon, href: "/search?category=new-in" },
  { key: "cat-deals", icon: TagIcon, href: "/search?category=deals" },
  { key: "svc-buyobot", icon: BotIcon, href: "/buyobot" },
  { key: "svc-repair", icon: WrenchIcon, href: "/repair" },
  { key: "svc-rent", icon: RentIcon, href: "/rent" },
  { key: "svc-diy", icon: HammerIcon, href: "/diy" },
  { key: "cat-gaming", icon: GamepadIcon, href: "/search?category=gaming" },
  { key: "cat-audio", icon: HeadphonesIcon, href: "/search?category=audio" },
  { key: "cat-wearables", icon: WatchIcon, href: "/search?category=wearables" },
  { key: "cat-home", icon: HouseIcon, href: "/search?category=home" },
];
