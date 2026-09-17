import { RefurbishedIcon } from "@/components/icons";

/**
 * The refurbished ("Renewed") seal — shown on a product card's photo and in the product page's buy box whenever
 * the backend marks the product isRefurbished.
 *
 * American Blue with a Mikado Yellow hairline and icon: the two brand colours, so it reads as
 * Buyology's own mark rather than a generic sale sticker, and it stays distinct from the yellow
 * discount pill and the white bestseller pill that share the photo. The slow gold sweep lives in
 * globals.css (.buyo-refurb), where it is switched off for anyone who prefers reduced motion.
 *
 * Purely presentational and hook-free, so both the client card and the buy box can use it.
 */
export function RefurbishedBadge({
  label,
  size = "sm",
  className = "",
}: {
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const sizing =
    size === "md"
      ? // Smaller type than the certification pill beside it, but the same 24px height, so the row
        // stays level.
        "gap-1 px-2.5 py-[4.5px] text-[11px]"
      : "gap-[3px] px-1.5 py-0.5 text-[9.5px] sm:gap-1 sm:px-2 sm:py-[3px] sm:text-[10px]";
  return (
    <span
      className={`buyo-refurb inline-flex items-center rounded-full font-bold tracking-wide text-white ${sizing} ${className}`}
    >
      <RefurbishedIcon
        className={`shrink-0 text-gold ${size === "md" ? "h-3 w-3" : "h-2.5 w-2.5 sm:h-3 sm:w-3"}`}
      />
      {label}
    </span>
  );
}
