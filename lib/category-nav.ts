import type { ComponentType, SVGProps } from "react";
import type { Category } from "@/lib/catalogue";
import {
  GamepadIcon,
  GridIcon,
  HeadphonesIcon,
  ImageIcon,
  LaptopIcon,
  PackageIcon,
  SmartphoneIcon,
  TagIcon,
  WatchIcon,
} from "@/components/icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Pure helpers for rendering the live category taxonomy. Deliberately NOT a client
 * module: the header uses them from a hook while the home departments list uses them
 * from a server component, and a "use client" file's exports cannot be called on the
 * server.
 */

/** Backend ProductCategory.icon keys (the dashboard's predefined set) → v2 icons. */
const CATEGORY_ICONS: Record<string, IconType> = {
  laptop: LaptopIcon,
  phone: SmartphoneIcon,
  tablet: SmartphoneIcon,
  watch: WatchIcon,
  audio: HeadphonesIcon,
  gaming: GamepadIcon,
  camera: ImageIcon,
  tv: LaptopIcon,
  accessories: PackageIcon,
  grid: GridIcon,
};

export function categoryIcon(key?: string | null): IconType {
  return (key && CATEGORY_ICONS[key]) || TagIcon;
}

/**
 * A category link a human can read: `/products?category=laptops` rather than a raw UUID, which
 * an SEO audit flagged as an unfriendly URL. ProductsView resolves a slug against both the
 * localized and the English taxonomy, so either form works — but a non-ASCII slug (an Arabic
 * one, percent-encoded into noise) is worse than the id, so those keep the id.
 */
export function categoryHref(c: Category): string {
  const slug = c.slug?.trim().toLowerCase();
  const readable = slug && /^[a-z0-9][a-z0-9-]*$/.test(slug) ? slug : c.id;
  return `/products?category=${readable}`;
}

/**
 * Root categories fit to render: deletion is a soft delete (status=INACTIVE) and the
 * endpoint returns everything, so an unfiltered list resurrects deleted categories as
 * dead links. A missing name (untranslated legacy row) would crash the render.
 */
export function renderableRoots(list: Category[]): Category[] {
  return list.filter(
    (c) => !c.parentId && !!c.name && (!c.status || c.status.toUpperCase() === "ACTIVE"),
  );
}
