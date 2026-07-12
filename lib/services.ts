import type { ComponentType, SVGProps } from "react";
import {
  BatteryChargingIcon,
  ExchangeIcon,
  HammerIcon,
  RentIcon,
  WrenchIcon,
} from "@/components/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type HomeService = {
  /** i18n key: label/hint from dictionaries.items, CTA from dictionaries.services.cta. */
  key: string;
  icon: IconType;
  href: string;
  /** Brand gradient for the banner. */
  tint: string;
  /** Featured (wider) tile on desktop. */
  wide?: boolean;
};

/** Buyology's signature services, shown as a bento on the home page. */
export const homeServices: HomeService[] = [
  {
    key: "svc-repair",
    icon: WrenchIcon,
    href: "/repair",
    tint: "from-brand to-brand-deep",
    wide: true,
  },
  {
    key: "svc-rent",
    icon: RentIcon,
    href: "/rent",
    tint: "from-brand-deep to-brand",
    wide: true,
  },
  {
    key: "svc-tradein",
    icon: ExchangeIcon,
    href: "/trade-in",
    tint: "from-brand to-gold-deep",
  },
  {
    key: "svc-powerbank",
    icon: BatteryChargingIcon,
    href: "/powerbank-stations",
    tint: "from-brand-deep to-brand",
  },
  {
    key: "svc-diy",
    icon: HammerIcon,
    href: "/diy",
    tint: "from-brand to-brand-deep",
  },
];
