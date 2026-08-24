"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/header/Logo";
import { SearchBar } from "@/components/header/SearchBar";
import { AccountButton } from "@/components/header/AccountButton";
import { NotificationBell } from "@/components/header/NotificationBell";
import { PrimaryNav } from "@/components/header/PrimaryNav";
import { AnnouncementBar } from "@/components/header/AnnouncementBar";
import { buyobot, services } from "@/lib/nav-data";
import { categoryHref, useLiveCategories } from "@/lib/live-categories";
import { WHO_WE_ARE_URL } from "@/lib/site";
import {
  ArrowRightShortIcon,
  BagIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  TagIcon,
} from "@/components/icons";
import { useI18n } from "@/components/i18n/language-provider";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";

function CountBadge({ count, bump }: { count: number; bump?: boolean }) {
  if (count <= 0) return null;
  return (
    <span
      key={bump ? count : undefined}
      className={`absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-fg ring-2 ring-background rtl:right-auto rtl:-left-0.5 ${
        bump ? "buyo-badge-pop" : ""
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Shared premium styling for the round icon actions (Buyology purple). */
const actionButton =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-brand-icon transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:w-10";

const mobileServices = [...services, buyobot];

export function Header() {
  const { t } = useI18n();
  const { count: cartCount, open: openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const liveCategories = useLiveCategories();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setMobileOpen(false);

  return (
    // The whole header is sticky so it stays pinned for the entire page scroll
    // (a sticky child would be confined to the short header box and scroll away).
    <header className="sticky top-0 z-50">
      <AnnouncementBar />

      <div
        className={`bg-background/85 backdrop-blur-md transition-shadow ${
          scrolled
            ? "border-b border-border-strong shadow-[var(--shadow-elevation)]"
            : "border-b border-border"
        }`}
      >
        {/* Main row: logo left · search centered · actions right (desktop) */}
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 py-3 sm:gap-x-4 lg:grid lg:grid-cols-[1fr_minmax(0,42rem)_1fr] lg:gap-4">
            <div className="order-1 flex items-center gap-1.5 sm:gap-2 lg:justify-self-start">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? t.header.closeMenu : t.header.openMenu}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className="-ms-1 inline-flex h-9 w-9 items-center justify-center rounded-xl text-brand-icon transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:w-10 lg:hidden"
              >
                {mobileOpen ? (
                  <CloseIcon className="h-5 w-5" />
                ) : (
                  <MenuIcon className="h-5 w-5" />
                )}
              </button>
              <Logo />
            </div>

            {/* Search: centered middle column on desktop, full-width line on mobile */}
            <SearchBar className="order-3 w-full lg:order-2 lg:w-full" />

            {/* Actions */}
            <div className="order-2 ms-auto flex shrink-0 items-center gap-0 sm:gap-1 lg:order-3 lg:ms-0 lg:justify-self-end">
              <AccountButton className="inline-flex items-center gap-2 rounded-xl px-1.5 py-2 text-sm font-medium text-brand-icon transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2.5" />

              {/* Hidden only on ultra-narrow screens — the mobile menu still links the wishlist. */}
              <Link
                id="header-wishlist"
                href="/wishlist"
                aria-label={`${t.header.wishlist}, ${wishlistCount} ${t.header.itemsSuffix}`}
                className={`${actionButton} hidden min-[380px]:inline-flex`}
              >
                <HeartIcon className="h-[22px] w-[22px]" />
                <CountBadge count={wishlistCount} bump />
              </Link>

              <button
                id="header-cart"
                type="button"
                onClick={openCart}
                aria-label={`${t.header.cart}, ${cartCount} ${t.header.itemsSuffix}`}
                aria-haspopup="dialog"
                className={actionButton}
              >
                <BagIcon className="h-[22px] w-[22px]" />
                <CountBadge count={cartCount} bump />
              </button>

              <NotificationBell className={actionButton} />
            </div>
          </div>
        </div>

        {/* Primary nav (services + mega-menu) — desktop; in the menu on mobile */}
        <div className="hidden lg:block">
          <PrimaryNav />
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <nav
            id="mobile-menu"
            aria-label={t.nav.menu}
            className="border-t border-border bg-background lg:hidden"
          >
            <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6">
              <Link
                href="/products"
                onClick={close}
                className="mb-3 flex items-center justify-between rounded-xl bg-brand-soft px-3 py-2.5 text-sm font-semibold text-brand-icon transition-colors hover:bg-primary hover:text-primary-fg"
              >
                <span className="flex items-center gap-2">
                  <TagIcon className="h-[18px] w-[18px]" />
                  {t.shop.title}
                </span>
                <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
              </Link>

              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                {t.palette.services}
              </p>
              <ul className="mb-3 grid grid-cols-2 gap-1">
                {mobileServices.map((s) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        onClick={close}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-2 ${
                          s.accent
                            ? "font-semibold text-warn dark:text-gold"
                            : "font-medium text-foreground"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] text-brand-icon" />
                        {t.items[s.key].label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {(liveCategories?.length ?? 0) > 0 && (
                <>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {t.palette.categories}
                  </p>
                  <ul className="grid grid-cols-2 gap-1">
                    {liveCategories!.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={categoryHref(c)}
                          onClick={close}
                          className="block rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="mx-auto flex max-w-[1400px] flex-wrap gap-x-5 gap-y-2 border-t border-border px-4 py-3 text-sm text-muted sm:px-6">
              <Link href="/account" onClick={close} className="hover:text-foreground">
                {t.header.account}
              </Link>
              <Link href="/wishlist" onClick={close} className="hover:text-foreground">
                {t.header.wishlist}
                {wishlistCount > 0 ? ` (${wishlistCount})` : ""}
              </Link>
              <Link href="/track" onClick={close} className="hover:text-foreground">
                {t.announcement.trackOrder}
              </Link>
              <Link href="/help" onClick={close} className="hover:text-foreground">
                {t.announcement.help}
              </Link>
              <a href={WHO_WE_ARE_URL} onClick={close} className="hover:text-foreground">
                {t.header.whoWeAre}
              </a>
              <Link href="/contact" onClick={close} className="hover:text-foreground">
                {t.contact.eyebrow}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
