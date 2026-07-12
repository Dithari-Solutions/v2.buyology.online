"use client";

import Link from "next/link";
import { stories } from "@/lib/stories";
import { useI18n } from "@/components/i18n/language-provider";

/**
 * Story bubbles under the header (like the buyology.online stories). Brand
 * gradient ring, distributed edge-to-edge at the banner width; scrolls on
 * mobile.
 */
export function Stories() {
  const { t } = useI18n();

  return (
    <section
      aria-label="Stories"
      className="mx-auto w-full max-w-[1400px] px-4 pt-5 sm:px-6"
    >
      <ul className="flex justify-between gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stories.map((story) => {
          const Icon = story.icon;
          return (
            <li key={story.key} className="shrink-0">
              <Link
                href={story.href}
                className="group flex w-[76px] flex-col items-center gap-2 rounded-xl focus-visible:outline-none"
              >
                <span className="rounded-full bg-gradient-to-br from-brand via-brand-icon to-gold p-[2.5px] transition-transform duration-300 group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background">
                  <span className="block rounded-full bg-background p-[3px]">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-gold/15 text-brand-icon">
                      <Icon className="h-6 w-6" />
                    </span>
                  </span>
                </span>
                <span className="w-full truncate text-center text-xs font-medium text-foreground">
                  {t.items[story.key].label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
