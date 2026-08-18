import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { site } from "@/lib/site";
import {
  ArrowRightShortIcon,
  InstagramIcon,
  SparklesIcon,
  UserIcon,
} from "@/components/icons";

/**
 * Headline giveaway promotion — the first thing on the home page.
 *
 * Deliberately no product photograph: the iPhone 18 Pro is unannounced, so the
 * prize is drawn as an abstract handset rather than implying we have official
 * imagery. The two entry conditions are numbered because they are a genuine
 * sequence (account first, so the follow can be matched to a winner).
 */
export async function GiveawayBanner() {
  const t = await getDict();

  const steps = [
    {
      icon: UserIcon,
      title: t.giveaway.step1Title,
      body: t.giveaway.step1Body,
    },
    {
      icon: InstagramIcon,
      title: t.giveaway.step2Title,
      body: t.giveaway.step2Body,
    },
  ];

  return (
    <section
      aria-labelledby="giveaway-heading"
      className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6 sm:pt-8"
    >
      <div
        className="relative isolate overflow-hidden rounded-3xl border border-border text-white"
        style={{
          background:
            "radial-gradient(120% 130% at 82% -20%, #665991 0%, #402f75 42%, #2b1f52 72%, #16102b 100%)",
        }}
      >
        {/* Ambient brand light */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -end-16 -top-24 h-80 w-80 rounded-full bg-gold/25 blur-[90px]" />
          <div className="absolute -bottom-28 start-1/4 h-72 w-72 rounded-full bg-brand-400/40 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-10 lg:p-12">
          {/* ── Copy ─────────────────────────────────────────────── */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-fg">
              <SparklesIcon className="h-3.5 w-3.5" />
              {t.giveaway.eyebrow}
            </p>

            <h2
              id="giveaway-heading"
              className="mt-5 text-4xl font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-5xl lg:text-6xl"
            >
              {t.giveaway.title}{" "}
              <span className="text-gold">{t.giveaway.prize}</span>
            </h2>

            <p className="mt-4 max-w-xl text-white/75">{t.giveaway.subtitle}</p>

            {/* Entry conditions */}
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
              {t.giveaway.stepsLabel}
            </p>
            <ol className="mt-3 grid gap-3 sm:grid-cols-2">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li
                    key={s.title}
                    className="rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-fg">
                        {i + 1}
                      </span>
                      <Icon className="h-[18px] w-[18px] text-gold" />
                      <span className="text-sm font-semibold">{s.title}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/65">
                      {s.body}
                    </p>
                  </li>
                );
              })}
            </ol>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-fg transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                {t.giveaway.cta}
                <ArrowRightShortIcon className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <InstagramIcon className="h-4 w-4" />
                {t.giveaway.instagram}
              </a>
            </div>

            <p className="mt-5 flex items-start gap-2 text-xs text-white/60">
              <span aria-hidden="true" className="mt-[3px] block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              {t.giveaway.note}
            </p>
          </div>

          {/* ── Prize artwork: an abstract handset, not a product photo ── */}
          <div aria-hidden="true" className="relative hidden justify-self-center lg:block">
            <div className="absolute inset-0 -z-10 rounded-full bg-gold/25 blur-[70px]" />
            <div className="buyo-float relative h-[340px] w-[168px] rounded-[2.2rem] border border-white/25 bg-gradient-to-b from-white/20 to-white/5 p-2 shadow-2xl backdrop-blur-md">
              <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#2b1f52] via-[#402f75] to-[#0d0a18]">
                <div className="absolute left-1/2 top-2.5 h-4 w-16 -translate-x-1/2 rounded-full bg-black/70" />
                <div className="absolute -right-6 top-10 h-24 w-24 rounded-full bg-gold/40 blur-2xl" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 p-4 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    {t.giveaway.eyebrow}
                  </span>
                  <span className="text-lg font-extrabold leading-tight text-gold">
                    {t.giveaway.prize}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
