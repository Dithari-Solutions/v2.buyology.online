"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { searchGroups } from "@/lib/search-data";
import {
  ArrowRightIcon,
  EnterKeyIcon,
  MicIcon,
  SearchIcon,
} from "@/components/icons";
import { useI18n } from "@/components/i18n/language-provider";
import { lockBodyScroll } from "@/lib/scroll-lock";

/** Animated gold equalizer shown in place of the mic while listening. */
function Equalizer() {
  const bars = [0, 0.15, 0.3, 0.15, 0];
  return (
    <span className="flex h-4 items-center gap-[3px]" aria-hidden="true">
      {bars.map((delay, i) => (
        <span
          key={i}
          className="buyo-eq-bar block h-full w-[3px] rounded-full bg-gold"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

function KeyHint({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-2 px-1 font-sans text-[11px] font-medium text-muted">
      {children}
    </kbd>
  );
}

/**
 * Command-palette search overlay. Rendered only while open (parent conditionally
 * mounts it) so state resets naturally on each open — no state-syncing effects.
 *
 * Keyboard model: focus stays on the combobox input (aria-activedescendant);
 * options are not tab stops. ↑/↓/↵ on the INPUT drive selection; Esc/Tab are
 * handled at the panel. Voice transcribes into the field (no auto-navigation).
 */
export function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const headingBaseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [voiceCommitted, setVoiceCommitted] = useState("");

  const { isListening, transcript, interim, isSupported, error, start, stop } =
    useSpeechRecognition();

  // Voice → text only: commit a final transcript into the field (render-time
  // adjustment, not an effect). No navigation is triggered by voice.
  if (transcript && transcript !== voiceCommitted) {
    setVoiceCommitted(transcript);
    setQuery(transcript);
    setActive(0);
  }

  const displayValue = isListening && interim ? interim : query;
  const q = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!q) return searchGroups;
    return searchGroups
      .map((g) => ({
        key: g.key,
        items: g.items.filter((it) => {
          const tr = t.items[it.key];
          return `${tr.label} ${tr.hint} ${it.keywords ?? ""}`
            .toLowerCase()
            .includes(q);
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [q, t]);

  const flatItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups],
  );

  const showFallback = q.length > 0 && flatItems.length === 0;
  const total = showFallback ? 1 : flatItems.length;
  const activeIndex = total > 0 ? Math.min(active, total - 1) : 0;
  const activeId = `cmd-opt-${activeIndex}`;

  // Focus the field, lock body scroll, and restore focus on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const unlock = lockBodyScroll();
    return () => {
      unlock();
      previouslyFocused?.focus?.();
    };
  }, []);

  // Keep the highlighted option visible.
  useEffect(() => {
    listRef.current
      ?.querySelector(`#${activeId}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  function navigate(href: string) {
    stop();
    onClose();
    router.push(href);
  }

  function selectIndex(index: number) {
    if (showFallback) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      return;
    }
    const item = flatItems[index];
    if (item) navigate(item.href);
  }

  function toggleVoice() {
    if (isListening) {
      stop();
      return;
    }
    // Allow re-speaking the same phrase: clear the last-committed guard so an
    // identical transcript is accepted again.
    setVoiceCommitted("");
    start();
  }

  // List navigation is scoped to the input so focused buttons keep native
  // activation (Enter on the mic/esc button does the button's own thing).
  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (total > 0) setActive((i) => (Math.min(i, total - 1) + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (total > 0)
        setActive((i) => (Math.min(i, total - 1) - 1 + total) % total);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectIndex(activeIndex);
    }
  }

  // Panel handles dismissal + a minimal focus trap for the remaining tab stops
  // (input, mic, esc).
  function onPanelKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Global running index so keyboard selection maps across groups.
  let runningIndex = -1;

  // Portal to <body> so the fixed overlay escapes the header's backdrop-filter
  // containing block (otherwise it only covers the header, not the whole page).
  return createPortal(
    <div
      className="buyo-overlay fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.palette.dialogLabel}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onPanelKeyDown}
        className="buyo-panel flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-elevated shadow-[var(--shadow-overlay)]"
      >
        {/* Search field */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <SearchIcon className="h-5 w-5 shrink-0 text-brand-icon" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-list"
            aria-activedescendant={total > 0 ? activeId : undefined}
            aria-label={t.palette.dialogLabel}
            autoComplete="off"
            spellCheck={false}
            value={displayValue}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={isListening ? t.palette.listening : t.palette.placeholder}
            className="h-16 min-w-0 flex-1 bg-transparent text-start text-[15px] text-foreground placeholder:text-muted focus:outline-none"
          />

          {isSupported && (
            <div className="relative flex items-center">
              {isListening && (
                <span className="buyo-pulse pointer-events-none absolute inset-0.5 rounded-full bg-gold/25" />
              )}
              <button
                type="button"
                onClick={toggleVoice}
                aria-pressed={isListening}
                aria-label={isListening ? "Stop voice search" : "Search by voice"}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isListening
                    ? "text-gold"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {isListening ? <Equalizer /> : <MicIcon className="h-[18px] w-[18px]" />}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="hidden shrink-0 items-center rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
          >
            esc
          </button>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="cmd-list"
          role="listbox"
          aria-label="Search results"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        >
          {showFallback ? (
            <button
              type="button"
              id="cmd-opt-0"
              role="option"
              aria-selected="true"
              tabIndex={-1}
              onMouseMove={() => setActive(0)}
              onClick={() => selectIndex(0)}
              className="flex w-full items-center gap-3 rounded-xl bg-brand-soft px-3 py-2.5 text-start"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-icon">
                <SearchIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {t.palette.searchFor} “{query.trim()}”
                </span>
                <span className="block truncate text-xs text-muted">
                  {t.palette.seeAll}
                </span>
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-brand-icon rtl:-scale-x-100" />
            </button>
          ) : (
            filteredGroups.map((group, gi) => {
              const headingId = `${headingBaseId}-${gi}`;
              return (
                <div
                  key={group.key}
                  role="group"
                  aria-labelledby={headingId}
                  className="mb-1"
                >
                  <p
                    id={headingId}
                    className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted"
                  >
                    {t.palette[group.key]}
                  </p>
                  {group.items.map((item) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    const isActive = index === activeIndex;
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        id={`cmd-opt-${index}`}
                        role="option"
                        aria-selected={isActive}
                        tabIndex={-1}
                        onMouseMove={() => setActive(index)}
                        onClick={() => selectIndex(index)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors ${
                          isActive ? "bg-brand-soft" : "hover:bg-surface-2"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isActive
                              ? "bg-brand text-white"
                              : "bg-brand-soft text-brand-icon"
                          }`}
                        >
                          <ItemIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {t.items[item.key].label}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {t.items[item.key].hint}
                          </span>
                        </span>
                        {isActive && (
                          <ArrowRightIcon className="h-4 w-4 shrink-0 text-brand-icon rtl:-scale-x-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <KeyHint>↑</KeyHint>
              <KeyHint>↓</KeyHint>
              {t.palette.navigate}
            </span>
            <span className="flex items-center gap-1.5">
              <KeyHint>
                <EnterKeyIcon className="h-3 w-3" />
              </KeyHint>
              {t.palette.select}
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            {error ? (
              <span className="text-warn">{error}</span>
            ) : isListening ? (
              <span className="text-warn">{t.palette.listening}</span>
            ) : (
              <>
                <KeyHint>esc</KeyHint>
                {t.palette.close}
              </>
            )}
          </span>
        </div>

        {/* Screen-reader announcements: listening state, errors, and what was heard */}
        <span className="sr-only" role="status" aria-live="polite">
          {error
            ? error
            : isListening
              ? t.palette.listening
              : voiceCommitted
                ? `${t.palette.heard}: ${voiceCommitted}`
                : ""}
        </span>
      </div>
    </div>,
    document.body,
  );
}
