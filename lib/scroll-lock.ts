let count = 0;
let previousOverflow = "";

/**
 * Reference-counted scroll lock. Locks the root element (this layout scrolls on
 * <html>, not <body>) so overlays actually stop the page from scrolling.
 * Overlapping overlays (cart drawer, command palette) compose correctly: the
 * page is only unlocked once every lock is released, regardless of order.
 * Returns an unlock fn.
 */
export function lockBodyScroll(): () => void {
  const el = document.documentElement;
  if (count === 0) {
    previousOverflow = el.style.overflow;
    el.style.overflow = "hidden";
  }
  count += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    count = Math.max(0, count - 1);
    if (count === 0) document.documentElement.style.overflow = previousOverflow;
  };
}
