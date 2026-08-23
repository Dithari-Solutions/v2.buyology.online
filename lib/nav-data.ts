import type { ComponentType, SVGProps } from "react";
import {
  BatteryChargingIcon,
  BotIcon,
  GamepadIcon,
  GridIcon,
  HammerIcon,
  HeadphonesIcon,
  HouseIcon,
  LaptopIcon,
  PackageIcon,
  RentIcon,
  SparklesIcon,
  TagIcon,
  WalletIcon,
  WatchIcon,
  WrenchIcon,
} from "@/components/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type NavItem = {
  /** Stable i18n key (see lib/i18n/dictionaries.ts → items). */
  key: string;
  label: string;
  href: string;
  icon: IconType;
  hint?: string;
  keywords?: string;
  accent?: boolean;
};

/**
 * Buyology's signature services — these lead the primary nav (the brand's
 * differentiators), while product categories live in the "All Categories"
 * mega-menu and the command palette. `label`/`hint` are English defaults;
 * localized copy is looked up by `key`.
 */
export const services: NavItem[] = [
  {
    key: "svc-repair",
    label: "Repair",
    href: "/repair",
    icon: WrenchIcon,
    hint: "Book a device repair",
    keywords: "fix broken screen battery service warranty təmir إصلاح",
  },
  {
    key: "svc-sell",
    label: "Sell",
    href: "/sell",
    icon: WalletIcon,
    hint: "Sell your device for cash",
    keywords: "sell trade cash buy-back device sat بيع",
  },
  {
    key: "svc-rent",
    label: "Rent",
    href: "/rent",
    icon: RentIcon,
    hint: "Rent tech by the day",
    keywords: "borrow lease hire subscription try icarə تأجير",
  },
  {
    key: "svc-powerbank",
    label: "Powerbank Stations",
    href: "/powerbank-stations",
    icon: BatteryChargingIcon,
    hint: "Find a charging station",
    keywords: "charge battery power station map swap şarj شحن",
  },
  {
    key: "svc-diy",
    label: "DIY",
    href: "/diy",
    icon: HammerIcon,
    hint: "Kits & build-it-yourself",
    keywords: "build kit maker projects parts mod düzəlt اصنع",
  },
];

/** Buyology's AI shopping assistant (branded), shown as a gold accent pill. */
export const buyobot: NavItem = {
  key: "svc-buyobot",
  label: "Buyobot",
  href: "/buyobot",
  icon: BotIcon,
  hint: "Your AI shopping assistant",
  keywords: "ai assistant bot chat concierge help recommend",
  accent: true,
};

/** The "All Categories" mega-menu trigger. */
export const allCategories: NavItem = {
  key: "nav-all",
  label: "All Categories",
  href: "/search",
  icon: GridIcon,
  hint: "Browse the full catalogue",
  keywords: "everything shop browse",
};

/** Product categories — surfaced via the mega-menu and command palette. */
export const productCategories: NavItem[] = [
  {
    key: "cat-electronics",
    label: "Electronics",
    href: "/search?category=electronics",
    icon: PackageIcon,
    hint: "Gadgets & devices",
    keywords: "devices gadgets tech elektronika إلكترونيات",
  },
  {
    key: "cat-audio",
    label: "Audio",
    href: "/search?category=audio",
    icon: HeadphonesIcon,
    hint: "Headphones, speakers & more",
    keywords: "sound music earbuds audio صوت",
  },
  {
    key: "cat-gaming",
    label: "Gaming",
    href: "/search?category=gaming",
    icon: GamepadIcon,
    hint: "Consoles & accessories",
    keywords: "console controller play oyun ألعاب",
  },
  {
    key: "cat-computing",
    label: "Computing",
    href: "/search?category=computing",
    icon: LaptopIcon,
    hint: "Laptops, desktops & parts",
    keywords: "laptop pc desktop kompüter حاسوب",
  },
  {
    key: "cat-wearables",
    label: "Wearables",
    href: "/search?category=wearables",
    icon: WatchIcon,
    hint: "Watches & smart rings",
    keywords: "watch band fitness ring saat ساعة",
  },
  {
    key: "cat-home",
    label: "Home",
    href: "/search?category=home",
    icon: HouseIcon,
    hint: "Smart home & living",
    keywords: "smart house living ev منزل",
  },
  {
    key: "cat-deals",
    label: "Deals",
    href: "/search?category=deals",
    icon: TagIcon,
    hint: "Limited-time offers",
    keywords: "discount offer sale save endirim عروض",
  },
  {
    key: "cat-newin",
    label: "New In",
    href: "/search?category=new-in",
    icon: SparklesIcon,
    hint: "Just landed",
    keywords: "latest fresh arrivals new yeni جديد",
  },
];
