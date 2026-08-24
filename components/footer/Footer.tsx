import Link from "next/link";
import Image from "next/image";
import { getDict } from "@/lib/i18n/server";
import { site } from "@/lib/site";
import { footerColumns, socialLinks } from "@/lib/footer";
import { NewsletterForm } from "@/components/footer/NewsletterForm";
import { FooterShopLinks } from "@/components/footer/FooterShopLinks";
import { TabbyLogo, TamaraLogo } from "@/components/cart/payment-logos";
import { CreditCardIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";

/**
 * Site footer — a deep-purple, always-dark band (consistent in light and dark
 * themes) with a newsletter signup, link columns, socials, payments and a legal
 * bar. Server component: copy is resolved from the locale cookie via getDict.
 */
export async function Footer() {
  const t = await getDict();
  const f = t.footer;
  const year = new Date().getFullYear();

  return (
    <footer
      className="text-white"
      style={{
        background: "linear-gradient(180deg, #402f75 0%, #2b1f52 100%)",
      }}
    >
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {f.newsletter.title}
            </h2>
            <p className="mt-1.5 text-sm text-white/60">
              {f.newsletter.subtitle}
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-8">
        {/* Brand */}
        <div className="md:col-span-2 lg:col-span-1">
          <Link
            href="/"
            aria-label={`${site.name} home`}
            className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Image
              src="/buyology-online-logo-dark.png"
              alt={site.name}
              width={318}
              height={70}
              className="h-8 w-auto"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-white/60">{f.tagline}</p>

          <p className="sr-only">{f.followUs}</p>
          <ul className="mt-5 flex gap-2.5">
            {socialLinks.map(({ key, label, href, icon: Icon }) => (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-gold hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </ul>

          <address className="mt-5 space-y-2 not-italic">
            <a
              href={`mailto:${site.contact.email}`}
              className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <MailIcon className="h-4 w-4 shrink-0" />
              {site.contact.email}
            </a>
            <a
              href={`tel:${site.contact.phoneE164}`}
              className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              dir="ltr"
            >
              <PhoneIcon className="h-4 w-4 shrink-0" />
              {site.contact.phone}
            </a>
            <p className="flex items-start gap-2 text-sm text-white/60">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {site.place.street}, {site.place.locality}, {site.place.countryName}
              </span>
            </p>
          </address>
        </div>

        {/* Link columns */}
        {footerColumns.map((col) => (
          <nav key={col.titleKey} aria-label={f.cols[col.titleKey]}>
            <h3 className="text-sm font-semibold text-white">
              {f.cols[col.titleKey]}
            </h3>
            {col.titleKey === "shop" ? (
              <FooterShopLinks allLabel={f.links.electronics} />
            ) : (
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.key}>
                    <Link
                      href={l.href}
                      className="rounded text-sm text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      {f.links[l.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 text-xs text-white/50 sm:flex-row sm:items-center sm:gap-4">
            <span>
              © {year} {site.name}. {f.rights}
            </span>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy" className="transition-colors hover:text-white">
                {f.privacy}
              </Link>
              <Link href="/terms" className="transition-colors hover:text-white">
                {f.terms}
              </Link>
              <Link href="/cookies" className="transition-colors hover:text-white">
                {f.cookies}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">{f.payments}</span>
            <div className="flex items-center gap-2">
              <TabbyLogo className="h-5 w-auto" />
              <TamaraLogo className="h-5 w-auto" />
              <span className="flex h-6 w-9 items-center justify-center rounded bg-white/10">
                <CreditCardIcon className="h-4 w-4 text-white/80" />
              </span>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1400px] px-4 pb-6 sm:px-6">
          <p className="text-xs text-white/40">{f.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
