"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { LanguageSwitcher } from "@/components/header/LanguageSwitcher";
import { TruckIcon } from "@/components/icons";
import { useI18n } from "@/components/i18n/language-provider";

/**
 * Slim top row: promotional message on the left (start), utility links,
 * language switcher and theme toggle on the right (end). Part of the sticky
 * header, so it stays visible while scrolling.
 */
export function AnnouncementBar() {
  const { t } = useI18n();

  return (
    <div className="border-b border-border bg-brand-deep text-white">
      <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <p className="flex min-w-0 items-center gap-2 text-xs text-white/85">
          <TruckIcon className="hidden h-4 w-4 shrink-0 text-gold sm:block" />
          <span className="truncate">
            {t.announcement.delivery}
            <span className="mx-2 hidden text-white/40 sm:inline">·</span>
            <span className="hidden sm:inline">{t.announcement.returns}</span>
            <span className="mx-2 hidden text-white/40 md:inline">·</span>
            <span className="hidden md:inline">{t.announcement.promo}</span>
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-1 text-xs">
          <Link
            href="/track"
            className="hidden rounded px-2 py-1 text-white/80 transition-colors hover:text-white sm:inline-block"
          >
            {t.announcement.trackOrder}
          </Link>
          <Link
            href="/help"
            className="hidden rounded px-2 py-1 text-white/80 transition-colors hover:text-white sm:inline-block"
          >
            {t.announcement.help}
          </Link>
          <Link
            href="/contact"
            className="hidden rounded px-2 py-1 text-white/80 transition-colors hover:text-white sm:inline-block"
          >
            {t.contact.eyebrow}
          </Link>
          <LanguageSwitcher />
          <span className="hidden font-medium text-white/70 sm:inline">
            AED
          </span>
          <span
            className="mx-1 hidden h-4 w-px bg-white/20 sm:block"
            aria-hidden="true"
          />
          <ThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
        </div>
      </div>
    </div>
  );
}
