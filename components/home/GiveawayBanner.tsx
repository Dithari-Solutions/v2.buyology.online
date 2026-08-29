import Image from "next/image";
import { getDict } from "@/lib/i18n/server";
import { GiveawayEntry } from "@/components/home/GiveawayEntry";
import { fetchGiveawayCampaign } from "@/lib/giveaway-api";
import { site } from "@/lib/site";
import {
  InstagramIcon,
  SparklesIcon,
  UserIcon,
} from "@/components/icons";

/**
 * Headline giveaway promotion — the first thing on the home page.
 *
 * The prize shot lives at /public/mock/iphone-18-pro.png — the supplied
 * render with its flat background cut out. `fill` + `object-contain` keeps the
 * aspect ratio undistorted; a back-only crop sits alongside it as
 * iphone-18-pro-back.png if the pair ever reads too small.
 *
 * The two entry conditions are numbered because they are a genuine sequence
 * (account first, so the follow can be matched to a winner).
 */
export async function GiveawayBanner() {
  // Checked before anything renders. A closed draw must not reach the page at all — hiding it in
  // CSS would still ship the prize shot and the entry steps to every visitor, and this banner is
  // the first thing on the home page. A null campaign (API unreachable) also renders nothing:
  // silence is the safe answer when we cannot tell whether the draw is still running.
  const campaign = await fetchGiveawayCampaign();
  if (!campaign?.open) return null;

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
      id="giveaway"
      aria-labelledby="giveaway-heading"
      className="mx-auto w-full max-w-[1400px] px-4 pt-6 sm:px-6 sm:pt-8"
    >
      <div className="buyo-giveaway-ground relative isolate overflow-hidden rounded-3xl border border-border text-white">
        {/* Ambient brand light */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -end-16 -top-24 h-80 w-80 rounded-full bg-gold/25 blur-[90px]" />
          <div className="absolute -bottom-28 start-1/4 h-72 w-72 rounded-full bg-brand/45 blur-[100px]" />
          <div className="buyo-dot-grid absolute inset-0 opacity-[0.12]" />
        </div>

        <div className="grid gap-8 p-6 sm:p-9 lg:min-h-[600px] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-10 lg:p-12">
          {/* ── Prize artwork, phone-sized (desktop uses the right column below) ── */}
          <div className="pointer-events-none relative mx-auto h-56 w-44 sm:h-72 sm:w-56 lg:hidden">
            <div
              aria-hidden="true"
              className="absolute start-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-[60px]"
            />
            <div className="buyo-float relative h-full w-full">
              <Image
                src="/mock/iphone-18-pro.png"
                alt={t.giveaway.prize}
                fill
                priority
                sizes="(min-width: 640px) 224px, 176px"
                className="rotate-[12deg] object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] rtl:-rotate-[12deg]"
              />
            </div>
          </div>

          {/* ── Copy ─────────────────────────────────────────────── */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary-fg">
              <SparklesIcon className="h-3.5 w-3.5" />
              {t.giveaway.eyebrow}
            </p>

            <h2
              id="giveaway-heading"
              className="mt-5 text-3xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-5xl sm:leading-[0.95] lg:text-6xl"
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

            <div className="mt-7">
              <GiveawayEntry />
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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

          {/* ── Prize artwork ────────────────────────────────────────
              Sits in its own right-hand column, tilted 12° and centred. The
              tilt is gentler than for a single handset because the supplied
              render is a front/back pair, and is mirrored under RTL. */}
          <div className="pointer-events-none relative hidden lg:block">
            <div
              aria-hidden="true"
              className="absolute start-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="absolute start-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/25 blur-[70px]"
            />

            {/* Centring and the float live on separate elements: `buyo-float`
                animates `transform`, which would otherwise replace the
                -translate-x/y-1/2 and drop the phone out of alignment. */}
            <div className="absolute start-1/2 top-1/2 h-[420px] w-[336px] -translate-x-1/2 -translate-y-1/2">
              <div className="buyo-float relative h-full w-full">
                <Image
                  src="/mock/iphone-18-pro.png"
                  alt={t.giveaway.prize}
                  fill
                  sizes="336px"
                  className="rotate-[12deg] object-contain drop-shadow-[0_38px_60px_rgba(0,0,0,0.62)] rtl:-rotate-[12deg]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
