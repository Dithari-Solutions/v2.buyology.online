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
    // Only the all-products link is static — the category links are the live taxonomy,
    // rendered by FooterShopLinks so a renamed or added category never leaves a dead link.
    links: [{ key: "electronics", href: "/products" }],
  },
  {
    titleKey: "buyology",
    links: [
      { key: "buyobot", href: "/buyobot" },
      { key: "repair", href: "/repair" },
      { key: "sell", href: "/sell" },
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
    ],
  },
  {
    titleKey: "company",
    // Only pages that exist: template links (careers, press, …) pointed nowhere and
    // fabricating their content would be worse than not linking them.
    links: [
      { key: "about", href: "/about" },
      { key: "contact", href: "/contact" },
    ],
  },
];

export const socialLinks: { key: string; label: string; href: string; icon: IconType }[] = [
  { key: "x", label: "X", href: site.social.x, icon: XIcon },
  { key: "instagram", label: "Instagram", href: site.social.instagram, icon: InstagramIcon },
  { key: "discord", label: "Discord", href: site.social.discord, icon: DiscordIcon },
];
