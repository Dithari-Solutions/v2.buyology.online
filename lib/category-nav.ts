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

export function categoryHref(c: Category): string {
  return `/products?category=${c.id}`;
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
