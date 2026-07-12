import type { ComponentType, SVGProps } from "react";
import {
  BagIcon,
  ChatIcon,
  GaugeIcon,
  HammerIcon,
  LifeBuoyIcon,
  LinkIcon,
  RentIcon,
  ShieldCheckIcon,
  StarIcon,
  WalletIcon,
} from "@/components/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type AiFeature = {
  /** i18n key into dictionaries.ai.features. */
  key: string;
  icon: IconType;
  href: string;
};

/** The ten Buyobot-powered tools, in the order shown in the section. */
export const aiFeatures: AiFeature[] = [
  { key: "recommender", icon: BagIcon, href: "/buyobot?tool=recommender" },
  { key: "budget", icon: WalletIcon, href: "/buyobot?tool=budget" },
  { key: "consultant", icon: ChatIcon, href: "/buyobot?tool=consultant" },
  { key: "compatibility", icon: LinkIcon, href: "/buyobot?tool=compatibility" },
  { key: "futureproof", icon: ShieldCheckIcon, href: "/buyobot?tool=future-proof" },
  { key: "performance", icon: GaugeIcon, href: "/buyobot?tool=performance" },
  { key: "setup", icon: HammerIcon, href: "/buyobot?tool=setup-builder" },
  { key: "tradein", icon: RentIcon, href: "/buyobot?tool=trade-in" },
  { key: "review", icon: StarIcon, href: "/buyobot?tool=reviews" },
  { key: "helpdesk", icon: LifeBuoyIcon, href: "/buyobot?tool=helpdesk" },
];
