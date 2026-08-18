"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  allCategories,
  buyobot,
  productCategories,
  services,
} from "@/lib/nav-data";
import {
  ArrowRightShortIcon,
  ChevronDownIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons";
import { WHO_WE_ARE_URL } from "@/lib/site";
import { useI18n } from "@/components/i18n/language-provider";

/**
 * Primary navigation (row 3): Buyology's signature services lead the bar, with
 * an "All Categories" mega-menu on the left and the Buyobot AI pill on the
 * right. Product categories live inside the mega-menu (and the command palette).
 */
export function PrimaryNav() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const AllIcon = allCategories.icon;
  const BuyobotIcon = buyobot.icon;

  return (
    <nav aria-label="Primary" className="relative border-t border-border">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <ul className="flex w-full items-center justify-between gap-1 py-2">
          {/* All Categories → mega-menu */}
          <li ref={wrapRef} className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-controls="mega-categories"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AllIcon className="h-4 w-4 text-brand-icon" />
              {t.items[allCategories.key].label}
              <ChevronDownIcon
                className={`h-4 w-4 text-muted transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <div
                id="mega-categories"
                aria-label="Shop by category"
                className="buyo-panel absolute start-0 top-full z-50 mt-1.5 w-[min(92vw,640px)] rounded-2xl border border-border bg-elevated p-3 shadow-[var(--shadow-overlay)]"
              >
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {t.nav.shopByCategory}
                </p>
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                  {productCategories.map((c) => {
                    const Icon = c.icon;
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-surface-2"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-icon">
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {t.items[c.key].label}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {t.items[c.key].hint}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href="/products"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border-t border-border px-2.5 pb-1 pt-3 text-sm font-semibold text-brand-icon transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {t.shop.title}
                  <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
                </Link>
              </div>
            )}
          </li>

          {/* All products */}
          <li>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <TagIcon className="h-4 w-4 text-brand-icon" />
              {t.shop.title}
            </Link>
          </li>

          {/* Signature services */}
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="h-4 w-4 text-brand-icon" />
                  {t.items[s.key].label}
                </Link>
              </li>
            );
          })}

          {/* Who We Are — lives on the corporate site, not this storefront */}
          <li>
            <a
              href={WHO_WE_ARE_URL}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <UsersIcon className="h-4 w-4 text-brand-icon" />
              {t.header.whoWeAre}
            </a>
          </li>

          {/* Buyobot — filled gold pill (dark text = high contrast) */}
          <li>
            <Link
              href={buyobot.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BuyobotIcon className="h-4 w-4" />
              {t.items[buyobot.key].label}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
