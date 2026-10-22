"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buyobot, services } from "@/lib/nav-data";
import { categoryHref, useLiveCategories } from "@/lib/live-categories";
import { fetchCategoryBrands } from "@/lib/catalogue";
import { ChevronDownIcon, TagIcon, UsersIcon } from "@/components/icons";
import { WHO_WE_ARE_URL } from "@/lib/site";
import { useI18n } from "@/components/i18n/language-provider";
import { AnnouncementsBadge } from "@/components/header/AnnouncementsBadge";
import { CategoriesMenu } from "@/components/header/CategoriesMenu";

type Panel = "categories" | "services";
const linkClass = "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const panelClass = "buyo-panel absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-10rem)] overflow-y-auto overscroll-contain border-y border-border bg-elevated shadow-[var(--shadow-overlay)]";

/** Stocked departments lead the bar; products and services use matching disclosure panels. */
export function PrimaryNav() {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState<Panel | null>(null);
  const categories = useLiveCategories();
  const navRef = useRef<HTMLElement>(null);
  const categoryTrigger = useRef<HTMLButtonElement>(null);
  const serviceTrigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const close = useCallback(() => { cancel(); setOpen(null); }, [cancel]);
  const scheduleOpen = useCallback((panel: Panel) => {
    cancel();
    if (panel === "categories") void fetchCategoryBrands(locale);
    timer.current = setTimeout(() => setOpen(panel), 150);
  }, [cancel, locale]);
  const scheduleClose = useCallback(() => {
    cancel();
    timer.current = setTimeout(() => {
      if (!navRef.current?.contains(document.activeElement)) setOpen(null);
    }, 180);
  }, [cancel]);

  useEffect(() => cancel, [cancel]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const inside = navRef.current?.contains(document.activeElement);
      close();
      if (inside) (open === "categories" ? categoryTrigger : serviceTrigger).current?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, close]);

  function toggle(panel: Panel) {
    cancel();
    setOpen((current) => current === panel ? null : panel);
  }

  const BuyobotIcon = buyobot.icon;
  return (
    <nav ref={navRef} aria-label="Primary" className="relative border-t border-border" onMouseLeave={scheduleClose}
      onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) close(); }}>
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-2 sm:px-6">
        <div className="flex shrink-0 items-center" onMouseEnter={() => scheduleOpen("categories")} onMouseLeave={scheduleClose}>
          <Link href="/products" onClick={close} onFocus={() => scheduleOpen("categories")} className={`${linkClass} font-semibold text-foreground`}>
            <TagIcon className="h-4 w-4 text-brand-icon" />{t.shop.title}
          </Link>
          <button ref={categoryTrigger} type="button" onClick={() => toggle("categories")} aria-expanded={open === "categories"} aria-controls="mega-categories" aria-label={t.nav.shopByCategory}
            className="-ms-2 rounded-full p-2 text-muted hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${open === "categories" ? "rotate-180" : ""}`} />
          </button>
          {open === "categories" && <div id="mega-categories" role="region" aria-label={t.nav.shopByCategory} onMouseEnter={cancel} className={panelClass}>
            <CategoriesMenu categories={categories} onNavigate={close} />
          </div>}
        </div>

        <ul aria-label={t.palette.categories} className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories?.map((category) => <li key={category.id} className="shrink-0" onMouseEnter={close}>
            <Link href={categoryHref(category)} onClick={close} onFocus={close} className={`${linkClass} text-foreground`}>{category.name}</Link>
          </li>)}
        </ul>

        <div className="shrink-0" onMouseEnter={() => scheduleOpen("services")} onMouseLeave={scheduleClose}>
          <button ref={serviceTrigger} type="button" aria-expanded={open === "services"} aria-controls="mega-services" onClick={() => toggle("services")} className={`${linkClass} font-semibold text-brand-icon`}>
            {t.palette.services}<ChevronDownIcon className={`h-4 w-4 transition-transform ${open === "services" ? "rotate-180" : ""}`} />
          </button>
          {open === "services" && <div id="mega-services" role="region" aria-label={t.palette.services} onMouseEnter={cancel} className={panelClass}>
            <div className="mx-auto max-w-[1400px] px-6 py-8">
              <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted">{t.palette.services}</p>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {services.map((service) => {
                  const Icon = service.icon;
                  return <li key={service.key}><Link href={service.href} onClick={close} className="group flex h-full items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-brand-icon/30 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="rounded-xl bg-brand-soft p-2.5 text-brand-icon"><Icon className="h-5 w-5" /></span>
                    <span className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-foreground">{t.items[service.key].label}{service.key === "svc-announcements" && <AnnouncementsBadge />}</span>
                  </Link></li>;
                })}
              </ul>
            </div>
          </div>}
        </div>
        <a href={WHO_WE_ARE_URL} onMouseEnter={close} className={`${linkClass} hidden xl:inline-flex`}><UsersIcon className="h-4 w-4 text-brand-icon" />{t.header.whoWeAre}</a>
        <Link href={buyobot.href} onMouseEnter={close} onClick={close} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-fg hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><BuyobotIcon className="h-4 w-4" />{t.items[buyobot.key].label}</Link>
      </div>
    </nav>
  );
}
