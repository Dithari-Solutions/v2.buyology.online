"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SearchModal } from "@/components/header/SearchModal";
import { CommandIcon, MicIcon, SearchIcon } from "@/components/icons";
import { useI18n } from "@/components/i18n/language-provider";

/* Platform detection for the shortcut hint (⌘K on macOS, Ctrl K elsewhere). */
const subscribe = () => () => {};
function readIsMac() {
  if (typeof navigator === "undefined") return true;
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent);
}
const readIsMacServer = () => true;

/**
 * Header search entry point. Renders a search-bar-styled trigger; clicking it
 * (or pressing ⌘K / Ctrl-K) opens the command-palette modal, which owns the
 * input, voice, and recommendations. No inline category selector.
 */
export function SearchBar({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const isMac = useSyncExternalStore(subscribe, readIsMac, readIsMacServer);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.header.openSearch}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 text-start shadow-[var(--shadow-elevation)] transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SearchIcon className="h-5 w-5 shrink-0 text-brand-icon" />
        <span className="flex-1 truncate text-[15px] text-muted">
          {t.header.searchPlaceholder}
        </span>
        <MicIcon
          className="h-[18px] w-[18px] shrink-0 text-brand-icon"
          aria-hidden="true"
        />
        <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] font-medium text-muted sm:inline-flex">
          {isMac ? <CommandIcon className="h-3 w-3" /> : <span>Ctrl</span>}
          <span>K</span>
        </kbd>
      </button>

      {open && <SearchModal onClose={() => setOpen(false)} />}
    </div>
  );
}
