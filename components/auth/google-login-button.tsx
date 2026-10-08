"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";
import { useAuth } from "./auth-provider";

type GoogleIdentity = {
  initialize(options: { client_id: string; callback(response: { credential: string }): void; auto_select: boolean }): void;
  renderButton(container: HTMLElement, options: Record<string, unknown>): void;
};
declare global { interface Window { google?: { accounts: { id: GoogleIdentity } }; } }

let loading: Promise<void> | null = null;
export function loadGoogleIdentity(locale: string): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://accounts.google.com/gsi/client?hl=${encodeURIComponent(locale)}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => { script.remove(); loading = null; reject(new Error("Google login failed to load")); };
      document.head.appendChild(script);
    });
  }
  return loading;
}

/** Google's own button provides its logo, localization, and supported browser login UI. */
export function GoogleLoginButton({ onDone }: { onDone?: () => void }) {
  const { t, locale } = useI18n();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const { googleSignIn } = useAuth();
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ googleSignIn, onDone });
  useEffect(() => { callbacks.current = { googleSignIn, onDone }; }, [googleSignIn, onDone]);
  const inFlight = useRef(false);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!clientId) return;
    let mounted = true;
    let observer: ResizeObserver | undefined;
    loadGoogleIdentity(locale).then(() => {
      if (!mounted || !container.current) return;
      window.google!.accounts.id.initialize({ client_id: clientId, auto_select: false,
        callback: async ({ credential }) => {
          if (!mounted || inFlight.current) return;
          inFlight.current = true; setBusy(true); setFailed(false);
          try {
            await callbacks.current.googleSignIn(credential);
            if (mounted) callbacks.current.onDone?.();
          } catch { if (mounted) setFailed(true); }
          finally { inFlight.current = false; if (mounted) setBusy(false); }
        },
      });
      const target = container.current;
      let previousWidth = 0;
      const render = () => {
        if (!mounted) return;
        const width = Math.floor(Math.min(target.clientWidth || 320, 400));
        if (width === previousWidth) return;
        previousWidth = width;
        target.replaceChildren();
        window.google!.accounts.id.renderButton(target, {
          type: "standard", theme: "outline", size: "large", text: "continue_with",
          shape: "pill", logo_alignment: "center", locale, width,
        });
      };
      render();
      observer = new ResizeObserver(render);
      observer.observe(target);
    }).catch(() => { if (mounted) setFailed(true); });
    return () => { mounted = false; observer?.disconnect(); };
  }, [clientId, locale]);
  if (!clientId) return null;
  return <div className="mb-3" aria-busy={busy}>
    <div ref={container} className={`flex w-full justify-center${busy ? " pointer-events-none opacity-50" : ""}`} />
    {failed && <p role="alert" className="mt-2 text-center text-sm text-red-600 dark:text-red-400">{t.auth.errors.googleFailed}</p>}
  </div>;
}
