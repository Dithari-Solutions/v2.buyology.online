"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { dirFor, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dict;
  setLocale: (next: Locale) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Provides the server-resolved locale + dictionary to client components.
 * Switching writes a cookie and calls router.refresh() so server components
 * (layout, home sections) re-render in the new language; <html lang/dir> is
 * also updated immediately for a snappy switch.
 */
export function LanguageProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dict;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    document.documentElement.dir = dirFor(next);
    router.refresh();
  }

  return (
    <I18nContext.Provider value={{ locale, dir: dirFor(locale), t: dict, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
