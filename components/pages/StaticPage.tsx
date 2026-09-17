import { Header } from "@/components/header/Header";

/** Shared shell for informational pages: centred prose column in the site tokens. */
export function StaticPage({
  title,
  subtitle,
  headerDir,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Overrides the page direction for the title and subtitle only; inherits it when left out. */
  headerDir?: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[820px] px-4 py-10 sm:px-6 sm:py-14">
        <div dir={headerDir}>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-3 leading-relaxed text-muted sm:mt-2 sm:leading-[1.35]">{subtitle}</p>
          )}
        </div>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-foreground/90">
          {children}
        </div>
      </main>
    </>
  );
}

export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-foreground">{heading}</h2>
      <div className="space-y-3 text-muted">{children}</div>
    </section>
  );
}
