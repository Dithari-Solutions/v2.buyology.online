"use client";

import { useEffect, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { fetchCategories, type Category } from "@/lib/catalogue";
import { useI18n } from "@/components/i18n/language-provider";
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
 * The LIVE category taxonomy for navigation surfaces (header mega-menu, mobile menu,
 * command palette). The static nav-data category list once pointed at slugs that never
 * existed in the backend — every link led to an empty page. Names arrive localized per
 * request language; links carry the category ID (ids are locale-stable, slugs are not).
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
 * Root categories in the current language. `null` while loading (render a skeleton),
 * `[]` on failure (render nothing — the all-products link always stands).
 * fetchCategories memoizes per locale+market with a short TTL, so every consumer in
 * the header shares one request.
 */
export function useLiveCategories(): Category[] | null {
  const { locale } = useI18n();
  const [cats, setCats] = useState<Category[] | null>(null);

  useEffect(() => {
    let stale = false;
    fetchCategories(locale)
      .then((list) => {
        // Deletion is a soft delete (status=INACTIVE) and the endpoint returns everything —
        // rendering unfiltered roots would resurrect every deleted category as a dead link.
        // A missing name (untranslated legacy row) would crash the render, so it drops too.
        if (!stale) {
          setCats(list.filter(
            (c) => !c.parentId && !!c.name && (!c.status || c.status.toUpperCase() === "ACTIVE"),
          ));
        }
      })
      .catch(() => {
        if (!stale) setCats([]);
      });
    return () => {
      stale = true;
    };
  }, [locale]);

  return cats;
}
