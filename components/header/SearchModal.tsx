"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { searchGroups } from "@/lib/search-data";
import { searchProducts } from "@/lib/catalogue";
import { categoryHref, categoryIcon, useLiveCategories } from "@/lib/live-categories";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/products";
import {
  ArrowRightIcon,
  EnterKeyIcon,
  MicIcon,
  SearchIcon,
} from "@/components/icons";
import { useI18n } from "@/components/i18n/language-provider";
import { lockBodyScroll } from "@/lib/scroll-lock";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/** One selectable row, whatever its source (live product, live category, static page). */
type Option = {
  id: string;
  href: string;
  label: string;
  hint?: string;
  icon?: IconType;
  imageUrl?: string | null;
  priceLabel?: string;
};
type OptionGroup = { heading: string; options: Option[] };

/** Web Speech recognition language per site locale — az/ar speech was decoded as English before. */
const SPEECH_LANG: Record<string, string> = { en: "en-US", az: "az-AZ", ar: "ar-AE" };

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
 * Search is REAL: typing (or speaking) two or more characters queries the live
 * catalogue (debounced) and the matching products lead the list, followed by the
 * live category taxonomy and the static service/page shortcuts; "Search for X"
 * always closes the list as the door to the full results page.
 *
 * Keyboard model: focus stays on the combobox input (aria-activedescendant);
 * options are not tab stops. ↑/↓/↵ on the INPUT drive selection; Esc/Tab are
 * handled at the panel. Voice transcribes into the field (no auto-navigation) —
 * the transcript triggers the same live product search as typing.
 */
export function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const headingBaseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [voiceCommitted, setVoiceCommitted] = useState("");
  const [hitState, setHitState] = useState<{ forQ: string; list: Product[] } | null>(null);

  const liveCategories = useLiveCategories();
  const { isListening, transcript, interim, isSupported, error, start, stop } =
    useSpeechRecognition(SPEECH_LANG[locale] ?? "en-US");

  // Voice → text only: commit a final transcript into the field (render-time
  // adjustment, not an effect). No navigation is triggered by voice.
  if (transcript && transcript !== voiceCommitted) {
    setVoiceCommitted(transcript);
    setQuery(transcript);
    setActive(0);
  }

  // When a debounced product batch lands, the Products group prepends and shifts every
  // index — snap the highlight back to the top (same render-time idiom as above).
  const [hitsSeen, setHitsSeen] = useState<string | null>(null);
  const hitsKey = hitState ? hitState.forQ : null;
  if (hitsKey !== hitsSeen) {
    setHitsSeen(hitsKey);
    setActive(0);
  }

  const displayValue = isListening && interim ? interim : query;
  const q = query.trim().toLowerCase();

  // Live catalogue search, debounced. Hits are stamped with the query they answer,
  // so "searching" is derived state and stale responses can never win a race.
  useEffect(() => {
    if (q.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchProducts(locale, q)
        .then((list) => {
          if (!cancelled) setHitState({ forQ: q, list: list.slice(0, 6) });
        })
        .catch(() => {
          if (!cancelled) setHitState({ forQ: q, list: [] });
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, locale]);

  const hits = hitState && hitState.forQ === q && q.length >= 2 ? hitState.list : null;
  const searching = q.length >= 2 && hits === null;

  const groups = useMemo<OptionGroup[]>(() => {
    const out: OptionGroup[] = [];
    if (hits && hits.length > 0) {
      out.push({
        heading: t.palette.products,
        options: hits.map((p) => ({
          id: `prod-${p.id}`,
          href: `/product/${p.id}`,
          label: p.name,
          imageUrl: p.image?.startsWith("http") ? p.image : null,
          priceLabel: formatMoney(p.price, p.currency),
        })),
      });
    }
    for (const g of searchGroups) {
      if (g.key === "categories") {
        // Live taxonomy, not the static list — those slugs never existed backend-side.
        // Locale-aware folding: root-locale toLowerCase mangles Azerbaijani İ/ı.
        const qLocale = query.trim().toLocaleLowerCase(locale);
        const cats = (liveCategories ?? []).filter(
          (c) => !qLocale || c.name.toLocaleLowerCase(locale).includes(qLocale),
        );
        if (cats.length > 0) {
          out.push({
            heading: t.palette.categories,
            options: cats.map((c) => ({
              id: `cat-${c.id}`,
              href: categoryHref(c),
              label: c.name,
              icon: categoryIcon(c.icon),
            })),
          });
        }
        continue;
      }
      const items = g.items.filter((it) => {
        const tr = t.items[it.key];
        return !q || `${tr.label} ${tr.hint} ${it.keywords ?? ""}`.toLowerCase().includes(q);
      });
      if (items.length > 0) {
        out.push({
          heading: t.palette[g.key],
          options: items.map((it) => ({
            id: it.key,
            href: it.href,
            label: t.items[it.key].label,
            hint: t.items[it.key].hint,
            icon: it.icon,
          })),
        });
      }
    }
    return out;
  }, [hits, liveCategories, q, query, locale, t]);

  const flatOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  // "Search for X" is always the final door out whenever there is a query.
  const hasFallback = q.length > 0;
  const total = flatOptions.length + (hasFallback ? 1 : 0);
  const activeIndex = total > 0 ? Math.min(active, total - 1) : 0;
  const activeId = `cmd-opt-${activeIndex}`;
  const fallbackIndex = flatOptions.length;

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
    if (hasFallback && index >= flatOptions.length) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      return;
    }
    const option = flatOptions[index];
    if (option) navigate(option.href);
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
      if (total > 0) selectIndex(activeIndex);
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
        // Option rows are <button tabIndex={-1}> — without the :not() on the button term
        // the trap's "last" lands on a row Tab can never reach and focus escapes the dialog.
        'button:not([tabindex="-1"]), input, [href], [tabindex]:not([tabindex="-1"])',
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
                aria-label={isListening ? t.palette.voiceStop : t.palette.voiceStart}
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
            aria-label={t.palette.closeSearch}
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
          aria-label={t.palette.resultsLabel}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
        >
          {groups.map((group, gi) => {
            const headingId = `${headingBaseId}-${gi}`;
            return (
              <div key={group.heading} role="group" aria-labelledby={headingId} className="mb-1">
                <p
                  id={headingId}
                  className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted"
                >
                  {group.heading}
                </p>
                {group.options.map((option) => {
                  runningIndex += 1;
                  const index = runningIndex;
                  const isActive = index === activeIndex;
                  const OptionIcon = option.icon;
                  return (
                    <button
                      key={option.id}
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
                      {option.imageUrl ? (
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                          <Image
                            src={option.imageUrl}
                            alt=""
                            fill
                            quality={75}
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        </span>
                      ) : (
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary text-primary-fg"
                              : "bg-brand-soft text-brand-icon"
                          }`}
                        >
                          {OptionIcon ? (
                            <OptionIcon className="h-5 w-5" />
                          ) : (
                            <SearchIcon className="h-5 w-5" />
                          )}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {option.label}
                        </span>
                        {(option.priceLabel ?? option.hint) && (
                          <span className="block truncate text-xs text-muted" dir={option.priceLabel ? "ltr" : undefined}>
                            {option.priceLabel ?? option.hint}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <ArrowRightIcon className="h-4 w-4 shrink-0 text-brand-icon rtl:-scale-x-100" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {hasFallback && (
            <button
              type="button"
              id={`cmd-opt-${fallbackIndex}`}
              role="option"
              aria-selected={fallbackIndex === activeIndex}
              tabIndex={-1}
              onMouseMove={() => setActive(fallbackIndex)}
              onClick={() => selectIndex(fallbackIndex)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors ${
                fallbackIndex === activeIndex ? "bg-brand-soft" : "hover:bg-surface-2"
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-icon">
                <SearchIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {t.palette.searchFor} “{query.trim()}”
                </span>
                <span className="block truncate text-xs text-muted">
                  {searching ? t.palette.searching : t.palette.seeAll}
                </span>
              </span>
              <ArrowRightIcon className="h-4 w-4 shrink-0 text-brand-icon rtl:-scale-x-100" />
            </button>
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
            ) : searching ? (
              <span>{t.palette.searching}</span>
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
