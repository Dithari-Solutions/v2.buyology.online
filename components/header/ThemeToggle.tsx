"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

export const THEME_STORAGE_KEY = "buyology-theme";

/**
 * Subscribe to `class` changes on <html> so the toggle re-renders whenever the
 * theme flips (from here or elsewhere) without mirroring state into an effect.
 */
function subscribe(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const isDarkNow = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark");

/**
 * Light/dark toggle. The initial theme is applied before paint by the inline
 * script in the root layout, so this reads the already-resolved DOM state via
 * useSyncExternalStore (server snapshot = light, to keep hydration stable).
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, isDarkNow, () => false);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* storage may be unavailable (private mode) — theme still applies */
    }
    // The MutationObserver above triggers the re-render; no setState needed.
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {isDark ? (
        <SunIcon className="h-[18px] w-[18px]" />
      ) : (
        <MoonIcon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
