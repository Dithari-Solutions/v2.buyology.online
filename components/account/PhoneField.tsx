"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "@/components/icons";
import { useI18n } from "@/components/i18n/language-provider";
import {
  findPhoneCountry,
  phoneCountries,
  priorityIso2,
  splitPhoneNumber,
  type PhoneCountry,
} from "@/lib/phone-codes";

/**
 * Phone number entry: a country dial-code combobox fused to a national-number
 * input, styled to sit flush beside <Field> in the same form grid.
 *
 * WHY A HIDDEN INPUT
 * The control is really two widgets, but a phone number is one value. Rather
 * than teach every consumer to stitch a `dialCode` and a `phoneNational` entry
 * back together, the two visible controls carry NO `name` at all and a single
 * `<input type="hidden" name={name}>` submits the combined `"+971 50 123 4567"`
 * string. Existing `new FormData(form).get(name)` handling (see
 * AddressesSection.onAdd) therefore keeps working unchanged — swapping a
 * <Field label={ad.phone} name="phone" /> for a <PhoneField> is a drop-in edit
 * with no change on the reading side. The hidden value is left empty until a
 * national number is typed, so a bare dial code never looks like a real answer;
 * `required` lives on the visible input because hidden inputs are barred from
 * constraint validation.
 *
 * DIRECTION
 * `dir="ltr"` sits on the row wrapper, not just the input: a `+` is bidi-class
 * ES and a leading one resolves as a neutral, so in Arabic the composite would
 * otherwise render as "971+" with the groups re-ordered and the dial code would
 * flip to the far side of the number. The wrapper isolates the whole run. Note
 * that Tailwind's `rtl:` variant matches `[dir="rtl"] *`, so it still fires
 * inside that island — the chevron deliberately has no `rtl:-scale-x-100`.
 *
 * KEYBOARD
 * Closed trigger: Enter/Space/Alt+↓ open; ↑/↓ open at the current selection;
 * Home/End open at first/last; any printable character opens and seeds the
 * filter. Open: ↑/↓ move (wrapping), Home/End jump, PageUp/PageDown step 10,
 * Enter or Alt+↑ commit, Escape closes without changing the selection, Tab
 * closes via focusout. Space types into the filter rather than committing —
 * this popup has a real text field, so country names with spaces must be
 * typeable. Focus returns to the trigger on Escape and on commit.
 */
export function PhoneField({
  label,
  name,
  defaultValue,
  required,
  searchLabel,
  noResultsLabel,
  resultsLabel,
  resultOneLabel,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  searchLabel: string;
  noResultsLabel: string;
  /** Plural noun announced with the match count, e.g. "countries". */
  resultsLabel: string;
  /** Singular form, used when exactly one country matches. */
  resultOneLabel: string;
}) {
  const { locale } = useI18n();

  // useId() emits punctuation that querySelector would choke on; strip it and
  // prefix so option ids stay plain CSS identifiers.
  const uid = `phone${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const labelId = `${uid}-label`;
  const triggerId = `${uid}-trigger`;
  const listId = `${uid}-list`;
  const optionId = (index: number) => `${uid}-opt-${index}`;

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Seeded once, like an uncontrolled defaultValue: later prop changes are
  // ignored so typing is never clobbered.
  const [seed] = useState(() => splitPhoneNumber(defaultValue ?? ""));
  const [country, setCountry] = useState<PhoneCountry>(seed.country);
  const [national, setNational] = useState(seed.national);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // Launch markets first, in the order priorityIso2 declares them; the rest
  // keep the dataset's alphabetical order.
  const [pinnedAll, othersAll] = useMemo(() => {
    const pinned = priorityIso2
      .map((iso) => findPhoneCountry(iso))
      .filter((c): c is PhoneCountry => c !== undefined);
    const isPinned = new Set(pinned.map((c) => c.iso2));
    return [
      pinned,
      phoneCountries.filter((c) => !isPinned.has(c.iso2)),
    ] as const;
  }, []);

  // The dataset carries English names only. Intl.DisplayNames renders each
  // ISO2 in the active locale, so an Arabic user reads (and can filter on)
  // Arabic country names. Falls back to the English name for codes CLDR does
  // not know (e.g. XK) or if the runtime lacks the API.
  const regionNames = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);

  // Built eagerly inside the memo so the lookup below is a pure read — a
  // lazily-filled cache would be a render-time mutation.
  const localisedNames = useMemo(() => {
    const out = new Map<string, string>();
    for (const c of phoneCountries) {
      let n = c.name;
      try {
        n = regionNames?.of(c.iso2) || c.name;
      } catch {
        n = c.name;
      }
      out.set(c.iso2, n);
    }
    return out;
  }, [regionNames]);

  const nameOf = (c: PhoneCountry) => localisedNames.get(c.iso2) ?? c.name;

  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");

  function matches(c: PhoneCountry) {
    if (!q) return true;
    if (c.name.toLowerCase().includes(q)) return true;
    if (nameOf(c).toLowerCase().includes(q)) return true;
    if (c.iso2.toLowerCase().startsWith(q)) return true;
    return digits.length > 0 && c.dial.replace(/\D/g, "").startsWith(digits);
  }

  const pinned = pinnedAll.filter(matches);
  const others = othersAll.filter(matches);
  const flat = [...pinned, ...others];
  const total = flat.length;
  const activeIndex = total > 0 ? Math.min(active, total - 1) : 0;
  const activeId = total > 0 ? optionId(activeIndex) : undefined;

  const selectedIndex = Math.max(
    [...pinnedAll, ...othersAll].findIndex((c) => c.iso2 === country.iso2),
    0,
  );

  const nationalValue = national.trim();
  const combined = nationalValue ? `${country.dial} ${nationalValue}` : "";

  function openList(seedQuery: string, index: number) {
    setQuery(seedQuery);
    setActive(index);
    setOpen(true);
  }

  function closeList(returnFocus: boolean) {
    setOpen(false);
    setQuery("");
    if (returnFocus) triggerRef.current?.focus();
  }

  function commit(next: PhoneCountry | undefined) {
    if (next) setCountry(next);
    closeList(true);
  }

  // Move focus into the filter as soon as the panel mounts.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  // Keep the highlighted option visible (non-smooth by default, so no
  // reduced-motion guard is needed).
  useEffect(() => {
    if (!open || !activeId) return;
    listRef.current
      ?.querySelector(`#${activeId}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeId]);

  // Outside click + Escape, mirroring the header dropdowns (PrimaryNav), which
  // also restore focus to the trigger.
  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(e: KeyboardEvent) {
      // Only claim Escape while focus is still inside this control. Otherwise
      // typing in the national-number field and pressing Escape would rip
      // focus back to the trigger (WCAG 2.4.3).
      if (e.key !== "Escape") return;
      const focused = document.activeElement;
      if (!wrapRef.current?.contains(focused)) return;
      const wasInPopup = popupRef.current?.contains(focused) ?? false;
      setOpen(false);
      setQuery("");
      // Only reclaim focus if it was inside the popup we just dismissed. If
      // the user is typing in the national-number field, moving focus would be
      // an unrequested change (WCAG 2.4.3).
      if (wasInPopup) triggerRef.current?.focus();
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Tabbing (or clicking) out of the whole control closes it. Neither header
  // dropdown does this, so both stay open when focus leaves; this one does not.
  function onWrapBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!open) return;
    const next = e.relatedTarget as Node | null;
    if (next && wrapRef.current?.contains(next)) return;
    setOpen(false);
    setQuery("");
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (open) return;
    const k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      openList("", selectedIndex);
    } else if (k === "Home") {
      e.preventDefault();
      openList("", 0);
    } else if (k === "End") {
      e.preventDefault();
      openList("", Math.max(pinnedAll.length + othersAll.length - 1, 0));
    } else if (
      k.length === 1 &&
      k !== " " &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      // Printable character opens the panel and seeds the filter with it.
      e.preventDefault();
      openList(k, 0);
    }
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const k = e.key;
    if (e.altKey && k === "ArrowUp") {
      e.preventDefault();
      commit(flat[activeIndex]);
    } else if (k === "ArrowDown") {
      e.preventDefault();
      if (total > 0) setActive((i) => (Math.min(i, total - 1) + 1) % total);
    } else if (k === "ArrowUp") {
      e.preventDefault();
      if (total > 0)
        setActive((i) => (Math.min(i, total - 1) - 1 + total) % total);
    } else if (k === "PageDown") {
      e.preventDefault();
      setActive((i) => Math.min(Math.min(i, total - 1) + 10, total - 1));
    } else if (k === "PageUp") {
      e.preventDefault();
      setActive((i) => Math.max(Math.min(i, total - 1) - 10, 0));
    } else if (k === "Enter") {
      e.preventDefault();
      commit(flat[activeIndex]);
    } else if (k === "Escape") {
      // Stop the key here so an enclosing modal does not close with it.
      e.preventDefault();
      e.stopPropagation();
      closeList(true);
    } else if (k === "Tab") {
      // APG: Tab dismisses the popup and moves on. Do NOT preventDefault and
      // do NOT pull focus back — the browser's own tab order takes over.
      closeList(false);
    }
  }

  // Pasting a full international number re-selects the country instead of
  // concatenating onto the current dial code. Handled on paste, not on change,
  // so simply typing a "+" never rewrites the chosen country.
  function onNationalPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").trim();
    if (!text.startsWith("+") && !text.startsWith("00")) return;
    e.preventDefault();
    const parsed = splitPhoneNumber(text);
    setCountry(parsed.country);
    setNational(sanitize(parsed.national));
  }

  function renderOption(c: PhoneCountry, index: number) {
    const isActive = index === activeIndex;
    const isSelected = c.iso2 === country.iso2;
    return (
      <button
        key={c.iso2}
        type="button"
        id={optionId(index)}
        role="option"
        aria-selected={isSelected}
        tabIndex={-1}
        onMouseMove={() => setActive(index)}
        // Keep DOM focus on the filter field so the click never blurs it.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => commit(c)}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start transition-colors ${
          isActive ? "bg-brand-soft" : "hover:bg-surface-2"
        }`}
      >
        <span aria-hidden="true" className="text-base leading-none">
          {c.flag}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
          {nameOf(c)}
        </span>
        <span className="shrink-0 text-xs text-muted">{c.dial}</span>
        {isSelected ? (
          <CheckIcon className="h-4 w-4 shrink-0 text-brand-icon" />
        ) : (
          <span aria-hidden="true" className="w-4 shrink-0" />
        )}
      </button>
    );
  }

  return (
    <div
      ref={wrapRef}
      role="group"
      aria-labelledby={labelId}
      onBlur={onWrapBlur}
    >
      <span
        id={labelId}
        className="mb-1.5 block text-sm font-medium text-foreground"
      >
        {label}
      </span>

      {/* One LTR island: the dial code stays before the number in every locale. */}
      <div dir="ltr" className="flex items-stretch">
        <div className="relative flex">
          <button
            ref={triggerRef}
            id={triggerId}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-labelledby={`${labelId} ${triggerId}`}
            // Never let the press move DOM focus: focus is placed explicitly
            // (filter field on open, trigger on close), so browsers that do not
            // focus buttons on click cannot blur the panel shut mid-click.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              open ? closeList(true) : openList("", selectedIndex)
            }
            onKeyDown={onTriggerKeyDown}
            className="relative flex items-center gap-1.5 rounded-s-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-2 focus-visible:z-10 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true" className="text-base leading-none">
              {country.flag}
            </span>
            {/* Flags are decorative and absent on some platforms — the country
                name is what names the trigger, the dial code is real text. */}
            <span className="sr-only">{country.name}</span>
            <span>{country.dial}</span>
            <ChevronDownIcon
              className={`h-3.5 w-3.5 text-muted transition-transform ${
                open ? "-rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div
              ref={popupRef}
              className="absolute start-0 top-full z-50 mt-1 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-xl border border-border bg-elevated shadow-[var(--shadow-overlay)]"
            >
              <div className="flex items-center gap-2 border-b border-border px-3">
                <SearchIcon className="h-4 w-4 shrink-0 text-brand-icon" />
                <input
                  ref={searchRef}
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={activeId}
                  aria-autocomplete="list"
                  aria-label={searchLabel}
                  placeholder={searchLabel}
                  autoComplete="off"
                  spellCheck={false}
                  dir="auto"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onSearchKeyDown}
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
                />
              </div>

              <p role="status" aria-live="polite" className="sr-only">
                {total === 0
                  ? noResultsLabel
                  : `${total} ${total === 1 ? resultOneLabel : resultsLabel}`}
              </p>

              <div
                ref={listRef}
                id={listId}
                role="listbox"
                aria-label={label}
                // Chromium makes an overflow scroller focusable, which would
                // add a dead tab stop; navigation is via aria-activedescendant.
                tabIndex={-1}
                className="max-h-64 overflow-y-auto overscroll-contain p-1"
              >
                {total === 0 ? (
                  <p
                    dir="auto"
                    className="px-3 py-6 text-center text-sm text-muted"
                  >
                    {noResultsLabel}
                  </p>
                ) : (
                  <>
                    {pinned.map((c, i) => renderOption(c, i))}
                    {pinned.length > 0 && others.length > 0 && (
                      <div
                        aria-hidden="true"
                        className="my-1 border-t border-border"
                      />
                    )}
                    {others.map((c, i) => renderOption(c, pinned.length + i))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          dir="ltr"
          aria-labelledby={labelId}
          required={required}
          value={national}
          onChange={(e) => setNational(sanitize(e.target.value))}
          onPaste={onNationalPaste}
          className="relative min-w-0 flex-1 rounded-e-xl border border-s-0 border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:z-10 focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      </div>

      {/* The single value the form actually submits. */}
      <input type="hidden" name={name} value={combined} />
    </div>
  );
}

/** Keep the national part ASCII-numeric: no "+", no Arabic-Indic digits. */
function sanitize(value: string) {
  return value.replace(/[^\d\s-]/g, "");
}
