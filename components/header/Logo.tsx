import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

/**
 * Brand lockup using the official BUYOLOGY.ONLINE wordmark, swapped per theme:
 * the black-wordmark asset in light mode and the white-wordmark one in dark.
 * Both are transparent PNGs, so the mark sits on any surface without a plate —
 * but the swap is still required, because the black wordmark is unreadable on
 * a dark ground and vice versa.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={`inline-flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`}
    >
      {/* Light theme */}
      <Image
        src="/buyology-online-logo.png"
        alt="Buyology"
        width={318}
        height={70}
        priority
        className="block h-7 w-auto sm:h-9 dark:hidden"
      />
      {/* Dark theme (transparent, white wordmark) */}
      <Image
        src="/buyology-online-logo-dark.png"
        alt="Buyology"
        width={318}
        height={70}
        priority
        className="hidden h-7 w-auto sm:h-9 dark:block"
      />
    </Link>
  );
}
