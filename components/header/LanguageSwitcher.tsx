"use client";

import { useEffect, useRef, useState } from "react";
import { locales, localeMeta } from "@/lib/i18n/config";
import { useI18n } from "@/components/i18n/language-provider";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "@/components/icons";

/** Language picker (EN / AZ / AR) shown in the announcement bar. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.language.label}: ${localeMeta[locale].native}`}
        className="inline-flex items-center gap-1.5 rounded px-2 py-1 font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <GlobeIcon className="h-4 w-4" />
        {localeMeta[locale].short}
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t.language.label}
          className="absolute end-0 z-50 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-border bg-elevated p-1 text-foreground shadow-[var(--shadow-overlay)]"
        >
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === locale}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-2 ${
                l === locale ? "font-semibold text-foreground" : "text-muted"
              }`}
            >
              <span>{localeMeta[l].native}</span>
              {l === locale ? (
                <CheckIcon className="h-4 w-4 text-brand-icon" />
              ) : (
                <span className="text-xs text-muted">{localeMeta[l].short}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
