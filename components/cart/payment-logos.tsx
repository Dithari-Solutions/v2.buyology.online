import type { SVGProps } from "react";

/**
 * Stylised Tabby / Tamara payment badges. These are brand-approximate wordmarks
 * (their real colours, drawn as SVG) — not the official logo files. Drop in the
 * providers' official SVGs to replace these; the layout stays the same.
 */

const WORDMARK_FONT =
  "var(--font-raleway), system-ui, -apple-system, sans-serif";

export function TabbyLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 62 24"
      role="img"
      aria-label="Tabby"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="62" height="24" rx="7" fill="#3EEDC7" />
      <text
        x="31"
        y="16.5"
        textAnchor="middle"
        fill="#04352C"
        fontSize="13.5"
        fontWeight="800"
        letterSpacing="-0.4"
        style={{ fontFamily: WORDMARK_FONT }}
      >
        tabby
      </text>
    </svg>
  );
}

export function TamaraLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 74 24"
      role="img"
      aria-label="Tamara"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="74" height="24" rx="7" fill="#FF6551" />
      <text
        x="37"
        y="16.5"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="13.5"
        fontWeight="800"
        letterSpacing="-0.4"
        style={{ fontFamily: WORDMARK_FONT }}
      >
        tamara
      </text>
    </svg>
  );
}
