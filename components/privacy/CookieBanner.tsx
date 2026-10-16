"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCookieConsent } from "./CookieConsentProvider";
import { useI18n } from "@/components/i18n/language-provider";

const copy = {
  en: { title: "Your privacy, your choice", body: "Necessary cookies keep your cart, account and checkout working. With your permission, analytics helps us improve the shop and marketing measures our campaigns.", accept: "Accept all", reject: "Reject optional", customize: "Customize", settings: "Cookie settings", details: "Cookie details", privacy: "Privacy policy", save: "Save preferences", close: "Close", necessary: "Necessary", necessaryBody: "Account security, cart, payment recovery, your chosen language and these preferences. Always on.", analytics: "Analytics", analyticsBody: "Google Analytics and first-party visit counts to understand how the shop is used.", marketing: "Marketing", marketingBody: "Meta Pixel and advertising tags for campaign and purchase attribution.", on: "Always on", note: "You can change your choice at any time using Cookie settings in the footer." },
  az: { title: "Məxfiliyiniz sizin seçiminizdir", body: "Zəruri kukilər səbətin, hesabın və sifarişin işləməsini təmin edir. İcazənizlə analitika mağazanı yaxşılaşdırmağa, marketinq isə kampaniyaları ölçməyə kömək edir.", accept: "Hamısını qəbul et", reject: "Əlavələri rədd et", customize: "Fərdiləşdir", settings: "Kuki ayarları", details: "Kuki məlumatları", privacy: "Məxfilik siyasəti", save: "Seçimləri yadda saxla", close: "Bağla", necessary: "Zəruri", necessaryBody: "Hesab təhlükəsizliyi, səbət, ödənişin bərpası, seçilmiş dil və bu ayarlar. Həmişə aktivdir.", analytics: "Analitika", analyticsBody: "Saytdan istifadəni anlamaq üçün Google Analytics və birinci tərəf ziyarət statistikası.", marketing: "Marketinq", marketingBody: "Kampaniyaların və alışların ölçülməsi üçün Meta Pixel və reklam teqləri.", on: "Həmişə aktiv", note: "Seçiminizi səhifənin altındakı Kuki ayarları vasitəsilə dəyişə bilərsiniz." },
  ar: { title: "خصوصيتك، اختيارك", body: "تحافظ ملفات الارتباط الضرورية على عمل السلة والحساب والدفع. وبإذنك، تساعدنا التحليلات على تحسين المتجر ويساعد التسويق على قياس حملاتنا.", accept: "قبول الكل", reject: "رفض الاختيارية", customize: "تخصيص", settings: "إعدادات ملفات الارتباط", details: "تفاصيل ملفات الارتباط", privacy: "سياسة الخصوصية", save: "حفظ التفضيلات", close: "إغلاق", necessary: "ضرورية", necessaryBody: "أمان الحساب والسلة واستعادة الدفع واللغة التي تختارها وهذه التفضيلات. مفعّلة دائماً.", analytics: "التحليلات", analyticsBody: "Google Analytics وإحصاءات الزيارات لفهم كيفية استخدام المتجر.", marketing: "التسويق", marketingBody: "Meta Pixel وعلامات الإعلان لقياس الحملات وعمليات الشراء.", on: "مفعّلة دائماً", note: "يمكنك تغيير اختيارك في أي وقت من إعدادات ملفات الارتباط أسفل الصفحة." },
};
const button = "min-h-11 rounded-xl border border-border-strong px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  const { openSettings } = useCookieConsent();
  const { locale } = useI18n();
  return <button type="button" onClick={openSettings} className={className}>{copy[locale].settings}</button>;
}

export function CookieBanner() {
  const { consent, settingsOpen, openSettings, closeSettings, save } = useCookieConsent();
  const { locale } = useI18n();
  const t = copy[locale];
  const dialog = useRef<HTMLDialogElement>(null);
  const [analytics, setAnalytics] = useState(false), [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (settingsOpen && !dialog.current?.open) dialog.current?.showModal();
    else if (!settingsOpen && dialog.current?.open) dialog.current.close();
  }, [settingsOpen]);

  return <>
    {!consent && !settingsOpen && <section aria-label={t.settings} className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-5xl rounded-2xl border border-border-strong bg-background p-4 text-foreground shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-6" data-cookie-banner>
      <button type="button" aria-label={`${t.close} — ${t.reject}`} onClick={() => save(false, false)} className="absolute end-2 top-2 flex h-11 w-11 items-center justify-center rounded-xl text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">×</button>
      <h2 className="pe-10 text-base font-bold sm:text-lg">{t.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{t.body} <Link href="/cookies" className="font-medium text-brand-icon underline underline-offset-2">{t.details}</Link></p>
      <div className="mt-4 grid grid-cols-1 gap-2 min-[390px]:grid-cols-3 sm:flex sm:flex-wrap">
        <button className={button} type="button" onClick={() => save(false, false)}>{t.reject}</button>
        <button className={button} type="button" onClick={() => { setAnalytics(false); setMarketing(false); openSettings(); }}>{t.customize}</button>
        <button className={`${button} border-primary bg-primary text-primary-fg hover:bg-primary-hover`} type="button" onClick={() => save(true, true)}>{t.accept}</button>
      </div>
    </section>}
    <dialog ref={dialog} onCancel={closeSettings} onClose={closeSettings} aria-labelledby="cookie-settings-title" className="m-auto max-h-[min(90dvh,760px)] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl border border-border bg-background p-5 text-foreground shadow-2xl backdrop:bg-black/50 sm:p-7"
      onToggle={event => { if ((event.target as HTMLDialogElement).open) { setAnalytics(consent?.analytics ?? false); setMarketing(consent?.marketing ?? false); } }}>
      <div className="flex items-start justify-between gap-4"><h2 id="cookie-settings-title" className="text-xl font-bold">{t.settings}</h2><button type="button" onClick={closeSettings} aria-label={t.close} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-2xl">×</button></div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{t.body}</p>
      <div className="mt-5 space-y-3">
        <div className="rounded-xl border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{t.necessary}</h3><span className="text-xs font-medium text-brand-icon">{t.on}</span></div><p className="mt-2 text-sm text-muted">{t.necessaryBody}</p></div>
        <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-border p-4"><span className="flex-1"><span className="font-semibold">{t.analytics}</span><span className="mt-2 block text-sm text-muted">{t.analyticsBody}</span></span><input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-primary" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /></label>
        <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-border p-4"><span className="flex-1"><span className="font-semibold">{t.marketing}</span><span className="mt-2 block text-sm text-muted">{t.marketingBody}</span></span><input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-primary" checked={marketing} onChange={e => setMarketing(e.target.checked)} /></label>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">{t.note} <Link href="/privacy" className="text-brand-icon underline">{t.privacy}</Link> · <Link href="/cookies" className="text-brand-icon underline">{t.details}</Link></p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2"><button type="button" className={button} onClick={() => save(false, false)}>{t.reject}</button><button type="button" className={`${button} border-primary bg-primary text-primary-fg hover:bg-primary-hover`} onClick={() => save(analytics, marketing)}>{t.save}</button></div>
    </dialog>
  </>;
}
