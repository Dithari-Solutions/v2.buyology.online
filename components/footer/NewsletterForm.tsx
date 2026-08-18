"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { ArrowRightShortIcon, CheckIcon } from "@/components/icons";

/** Footer newsletter signup (UI-only; shows a success state on submit). */
export function NewsletterForm() {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  const nl = t.footer.newsletter;

  return (
    <div>
      {done ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-3.5 text-sm font-medium text-white"
        >
          <CheckIcon className="buyo-pop h-5 w-5 text-gold" />
          {nl.success}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
          className="flex gap-2"
        >
          <input
            type="email"
            required
            placeholder={nl.placeholder}
            aria-label={nl.placeholder}
            className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-gold/60"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            {nl.subscribe}
            <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
          </button>
        </form>
      )}
      <p className="mt-2.5 text-xs text-white/50">{nl.note}</p>
    </div>
  );
}
