"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useI18n } from "@/components/i18n/language-provider";
import { lockBodyScroll } from "@/lib/scroll-lock";
import { EyeIcon, EyeOffIcon, LockIcon } from "@/components/icons";

const PASSWORD = "Buythewhy@xyz";
const KEY = "buyo-gate-unlocked";

/* ---- tiny external store: unlock flag persisted for the browser session ---- */
const listeners = new Set<() => void>();
// In-memory source of truth for the current session. sessionStorage is only a
// persistence layer on top: if it is unavailable (private mode, sandboxed
// iframe, storage blocked by policy) the unlock still takes effect — we just
// lose persistence across a reload.
let unlockedMem = false;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getSnapshot() {
  if (unlockedMem) return true;
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
function getServerSnapshot() {
  return false;
}
function unlockSession() {
  unlockedMem = true;
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* storage blocked — the in-memory flag still unlocks for this session */
  }
  listeners.forEach((l) => l());
}

/**
 * Full-screen entry gate. Rendered locked-by-default so no page content flashes
 * before the password is entered; the rest of the document is made `inert` while
 * it is up. Client-only (no backend) — the unlock is remembered for the browser
 * session, so a refresh during the session doesn't re-prompt.
 */
export function PasswordGate() {
  const { t } = useI18n();
  const unlocked = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // While gated: lock page scroll, make everything else inert, and focus input.
  useEffect(() => {
    if (unlocked) return;
    const release = lockBodyScroll();
    const gate = rootRef.current;
    const changed: { el: HTMLElement; hadAriaHidden: boolean }[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el === gate || !(el instanceof HTMLElement)) continue;
      if (!el.hasAttribute("inert")) {
        const hadAriaHidden = el.hasAttribute("aria-hidden");
        el.setAttribute("inert", "");
        if (!hadAriaHidden) el.setAttribute("aria-hidden", "true");
        changed.push({ el, hadAriaHidden });
      }
    }
    inputRef.current?.focus();
    return () => {
      release();
      for (const { el, hadAriaHidden } of changed) {
        el.removeAttribute("inert");
        if (!hadAriaHidden) el.removeAttribute("aria-hidden");
      }
    };
  }, [unlocked]);

  if (unlocked) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value === PASSWORD) {
      unlockSession();
    } else {
      setError(true);
      setAttempts((a) => a + 1);
      setShake(true);
      inputRef.current?.select();
    }
  }

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto px-6 py-10"
      style={{
        background:
          "radial-gradient(1100px 620px at 50% -8%, #665991 0%, #402f75 38%, #2b1f52 66%, #000000 100%)",
      }}
    >
      <div
        className={`w-full max-w-sm text-center ${shake ? "buyo-shake" : ""}`}
        onAnimationEnd={() => setShake(false)}
      >
        <Image
          src="/buyology-online-logo-dark.png"
          alt="Buyology"
          width={318}
          height={70}
          priority
          className="mx-auto h-9 w-auto sm:h-10"
        />

        <h1 id="gate-title" className="mt-8 text-xl font-semibold text-white">
          {t.gate.title}
        </h1>
        <p className="mt-2 text-sm text-white/60">{t.gate.subtitle}</p>

        <form onSubmit={onSubmit} className="mt-7" noValidate>
          <div className="relative">
            <input
              ref={inputRef}
              type={show ? "text" : "password"}
              name="password"
              autoComplete="off"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(false);
              }}
              aria-label={t.gate.label}
              aria-invalid={error}
              aria-describedby={error ? "gate-error" : undefined}
              placeholder={t.gate.placeholder}
              className={`w-full rounded-2xl border bg-white/10 px-12 py-3.5 text-center text-white backdrop-blur-sm transition placeholder:text-white/60 focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400/70 focus:ring-red-400/60"
                  : "border-white/20 focus:border-white/40 focus:ring-gold/60"
              }`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? t.gate.hide : t.gate.show}
              className="absolute inset-y-0 end-2 my-auto flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {show ? (
                <EyeOffIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {error && (
            <p
              id="gate-error"
              key={attempts}
              role="alert"
              className="mt-3 text-sm font-medium text-red-200"
            >
              {t.gate.error}
            </p>
          )}

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-fg shadow-lg shadow-black/20 transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <LockIcon className="h-4 w-4" />
            {t.gate.submit}
          </button>
        </form>
      </div>
    </div>
  );
}
