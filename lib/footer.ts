import type { ComponentType, SVGProps } from "react";
import { DiscordIcon, InstagramIcon, XIcon } from "@/components/icons";
import { site } from "@/lib/site";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export type FooterLink = { key: string; href: string };
export type FooterColumn = { titleKey: string; links: FooterLink[] };

/** Footer link columns. `titleKey`/link `key` resolve to the footer dictionary. */
export const footerColumns: FooterColumn[] = [
  {
    titleKey: "shop",
    links: [
      { key: "electronics", href: "/products" },
      { key: "audio", href: "/products?category=Audio" },
      { key: "gaming", href: "/products?category=Gaming" },
      { key: "computing", href: "/products?category=Computing" },
      { key: "wearables", href: "/products?category=Wearables" },
      { key: "home", href: "/products?category=Home" },
    ],
  },
  {
    titleKey: "buyology",
    links: [
      { key: "buyobot", href: "/buyobot" },
      { key: "repair", href: "/repair" },
      { key: "rent", href: "/rent" },
      { key: "tradein", href: "/trade-in" },
      { key: "powerbank", href: "/powerbank-stations" },
      { key: "diy", href: "/diy" },
    ],
  },
  {
    titleKey: "support",
    links: [
      { key: "help", href: "/help" },
      { key: "track", href: "/track" },
      { key: "shipping", href: "/shipping" },
      { key: "returns", href: "/returns" },
      { key: "warranty", href: "/warranty" },
      { key: "contact", href: "/contact" },
    ],
  },
  {
    titleKey: "company",
    links: [
      { key: "about", href: "/about" },
      { key: "careers", href: "/careers" },
      { key: "sustainability", href: "/sustainability" },
      { key: "press", href: "/press" },
      { key: "affiliates", href: "/affiliates" },
    ],
  },
];

export const socialLinks: { key: string; label: string; href: string; icon: IconType }[] = [
  { key: "x", label: "X", href: site.social.x, icon: XIcon },
  { key: "instagram", label: "Instagram", href: site.social.instagram, icon: InstagramIcon },
  { key: "discord", label: "Discord", href: site.social.discord, icon: DiscordIcon },
];
