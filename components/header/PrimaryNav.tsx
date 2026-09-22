"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buyobot, services } from "@/lib/nav-data";
import { useLiveCategories } from "@/lib/live-categories";
import { fetchCategoryBrands } from "@/lib/catalogue";
import { ChevronDownIcon, TagIcon, UsersIcon } from "@/components/icons";
import { WHO_WE_ARE_URL } from "@/lib/site";
import { useI18n } from "@/components/i18n/language-provider";
import { AnnouncementsBadge } from "@/components/header/AnnouncementsBadge";
import { CategoriesMenu } from "@/components/header/CategoriesMenu";

/**
 * How long a pointer must rest before the menu opens, and linger before it closes.
 *
 * <p>150ms because a pointer crossing the ~130px label on its way to another nav item takes about
 * 160-260ms: any less and a pass-by drops a half-screen panel over the page.
 */
const OPEN_DELAY_MS = 150;
const CLOSE_DELAY_MS = 180;

/**
 * Primary navigation (row 3): Buyology's signature services lead the bar, with the Buyobot AI pill
 * on the right.
 *
 * <p>"All products" is also the way into the catalogue menu: pointing at it drops a full-width
 * panel with the departments on the left and the brands each one carries on the right. It replaces
 * the old "All Categories" button, which sat beside "All products" saying almost the same thing and
 * opened a 640px grid of tiles.
 *
 * <p>The label stays a link, so a tap or a click still goes straight to the catalogue and the menu
 * is never the only way through; the chevron beside it is the button that opens the panel for
 * anyone without a pointer to hover with.
 */
export function PrimaryNav() {
  const { t, locale } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const liveCategories = useLiveCategories();
  const navRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPending = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  // Delays on both edges: opening instantly makes the panel flash while a pointer crosses the bar
  // on its way elsewhere, and closing instantly snatches it away while the pointer travels the gap
  // between the label and the panel.
  const scheduleOpen = useCallback(() => {
    cancelPending();
    // Start the brands read on intent rather than on open: it is a catalogue-wide request, and the
    // panel would otherwise show its waiting state for as long as the backend takes to answer.
    // The result is cached, so the menu's own call reuses this one.
    void fetchCategoryBrands(locale);
    timerRef.current = setTimeout(() => setMenuOpen(true), OPEN_DELAY_MS);
  }, [cancelPending, locale]);

  const scheduleClose = useCallback(() => {
    cancelPending();
    timerRef.current = setTimeout(() => {
      // A pointer wandering off the header must not yank the panel out from under someone who is
      // tabbing through it — that would drop focus onto <body> and restart their next Tab at the
      // top of the document.
      if (navRef.current?.contains(document.activeElement)) return;
      setMenuOpen(false);
    }, CLOSE_DELAY_MS);
  }, [cancelPending]);

  const closeNow = useCallback(() => {
    cancelPending();
    setMenuOpen(false);
  }, [cancelPending]);

  useEffect(() => cancelPending, [cancelPending]);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) closeNow();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      // Only take focus if it is already in here. The panel can be open purely because a pointer is
      // resting on the label, and Escape pressed while typing elsewhere on the page (dismissing a
      // combobox, say) must not fling focus up into the header.
      const inside = navRef.current?.contains(document.activeElement);
      closeNow();
      if (inside) triggerRef.current?.focus();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeNow]);

  const BuyobotIcon = buyobot.icon;

  return (
    <nav
      aria-label="Primary"
      ref={navRef}
      className="relative border-t border-border"
      onMouseLeave={scheduleClose}
      // Tabbing out of the whole nav closes the panel; moving between the trigger and the links
      // inside the panel does not, because the new focus is still within the nav.
      onBlur={(e) => {
        // relatedTarget is null when focus goes nowhere focusable — clicking the panel's own
        // background, or the browser chrome. Closing on that would swallow a click mid-press, so
        // only a real focus move OUT of the nav closes it.
        const next = e.relatedTarget as Node | null;
        if (next && !e.currentTarget.contains(next)) closeNow();
      }}
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <ul className="flex w-full items-center justify-between gap-1 py-2">
          {/* All products → the catalogue, and the categories mega-menu */}
          <li className="flex items-center" onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
            <Link
              href="/products"
              onClick={closeNow}
              onFocus={scheduleOpen}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <TagIcon className="h-4 w-4 text-brand-icon" />
              {t.shop.title}
            </Link>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => {
                cancelPending();
                setMenuOpen((v) => !v);
              }}
              aria-expanded={menuOpen}
              // No aria-haspopup: "menu" would promise a menu widget with arrow-key semantics the
              // panel does not implement, and the panel is a region of links, not a menu.
              aria-controls="mega-categories"
              aria-label={t.nav.shopByCategory}
              className="-ms-1 rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Rendered inside the trigger's item rather than at the end of the bar: the panel is
                positioned against the <nav> either way, so nothing moves, but tabbing out of the
                trigger now lands in the menu instead of walking the whole bar first. */}
            {menuOpen && (
              <div
                id="mega-categories"
                role="region"
                aria-label={t.nav.shopByCategory}
                onMouseEnter={cancelPending}
                // Capped and scrollable: anchored under a sticky header, anything past the viewport
                // is otherwise unreachable on a short laptop screen.
                className="buyo-panel absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain border-y border-border bg-elevated shadow-[var(--shadow-overlay)]"
              >
                <CategoriesMenu categories={liveCategories} onNavigate={closeNow} />
              </div>
            )}
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
                  {/* Only announcements carry a count — the other services have nothing to be
                      "new" about. */}
                  {s.key === "svc-announcements" && <AnnouncementsBadge />}
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
