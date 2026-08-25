import {
  buyobot,
  productCategories,
  services,
  type NavItem,
} from "@/lib/nav-data";
import {
  BagIcon,
  HeartIcon,
  LifeBuoyIcon,
  TrendingUpIcon,
  TruckIcon,
  UserIcon,
} from "@/components/icons";

export type SearchGroup = {
  /** i18n key for the group heading (palette.<key>). */
  key: "trending" | "services" | "categories" | "quickActions";
  items: NavItem[];
};

const trending: NavItem[] = [
  {
    key: "trend-earbuds",
    label: "Wireless earbuds",
    hint: "Audio · most searched",
    href: "/search?q=wireless%20earbuds",
    icon: TrendingUpIcon,
    keywords: "airpods headphones buds qulaqlıq سماعة",
  },
  {
    key: "trend-oled",
    label: "4K OLED monitor",
    hint: "Computing · trending",
    href: "/search?q=4k%20oled%20monitor",
    icon: TrendingUpIcon,
    keywords: "display screen 144hz monitor شاشة",
  },
  {
    key: "trend-console",
    label: "Handheld console",
    hint: "Gaming · trending",
    href: "/search?q=handheld%20console",
    icon: TrendingUpIcon,
    keywords: "portable switch steam deck konsol",
  },
  {
    key: "trend-ring",
    label: "Smart ring",
    hint: "Wearables · new wave",
    href: "/search?q=smart%20ring",
    icon: TrendingUpIcon,
    keywords: "fitness tracker health üzük خاتم",
  },
];

const quickActions: NavItem[] = [
  {
    key: "quick-track",
    label: "Track an order",
    hint: "Where's my delivery",
    href: "/track",
    icon: TruckIcon,
    keywords: "shipping delivery status izlə تتبع",
  },
  {
    key: "quick-cart",
    label: "View cart",
    hint: "Items ready to checkout",
    href: "/cart",
    icon: BagIcon,
    keywords: "basket checkout buy səbət سلة",
  },
  {
    key: "quick-wishlist",
    label: "Wishlist",
    hint: "Saved for later",
    href: "/wishlist",
    icon: HeartIcon,
    keywords: "saved favourites likes istək رغبات",
  },
  {
    key: "quick-account",
    label: "Account",
    hint: "Profile & settings",
    href: "/account",
    icon: UserIcon,
    keywords: "profile settings login hesab حساب",
  },
  {
    key: "quick-help",
    label: "Help centre",
    hint: "Support & FAQs",
    href: "/help",
    icon: LifeBuoyIcon,
    keywords: "support faq contact kömək مساعدة",
  },
];

/** Grouped recommendations shown when the command palette opens (UI only). */
export const searchGroups: SearchGroup[] = [
  { key: "trending", items: trending },
  { key: "services", items: [...services, buyobot] },
  { key: "categories", items: productCategories },
  { key: "quickActions", items: quickActions },
];
