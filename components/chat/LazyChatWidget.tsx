"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";

const ChatWidget = dynamic(() => import("./ChatWidget").then(module => module.ChatWidget), { ssr: false });

/** Load the assistant and its product renderer when requested, not on every storefront visit. */
export function LazyChatWidget() {
  const [requested, setRequested] = useState(false);
  const { t } = useI18n();
  if (requested) return <ChatWidget initialOpen />;
  return <button type="button" aria-label={t.chat.launch} onClick={() => setRequested(true)} className="fixed bottom-4 end-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-fg shadow-[var(--shadow-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-6 sm:end-6">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M7 9h10M7 13h7"/></svg>
  </button>;
}
