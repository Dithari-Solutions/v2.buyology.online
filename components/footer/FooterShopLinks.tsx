"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCategories, type Category } from "@/lib/catalogue";
import { useI18n } from "@/components/i18n/language-provider";

const linkCls =
  "rounded text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

/**
 * The footer's shop column, from the LIVE category taxonomy — a hardcoded list here once
 * pointed at categories that never existed, sending every link to an unfiltered page. Links
 * carry the category ID: names and slugs are localized per language, ids are not, so a
 * shared URL keeps meaning the same category in every locale. Client component on purpose —
 * the Footer itself is a server component in static pages and must not fetch per-request.
 */
export function FooterShopLinks({ allLabel }: { allLabel: string }) {
  const { locale } = useI18n();
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    let stale = false;
    fetchCategories(locale)
      .then((list) => {
        if (!stale) setCats(list.filter((c) => !c.parentId).slice(0, 6));
      })
      .catch(() => {
        /* the all-products link still stands */
      });
    return () => {
      stale = true;
    };
  }, [locale]);

  return (
    <ul className="mt-4 space-y-2.5">
      <li>
        <Link href="/products" className={linkCls}>
          {allLabel}
        </Link>
      </li>
      {cats.map((c) => (
        <li key={c.id}>
          <Link href={`/products?category=${c.id}`} className={linkCls}>
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
