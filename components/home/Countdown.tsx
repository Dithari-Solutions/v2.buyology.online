"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Live HH:MM:SS countdown shown in the flash-deals header. Starts from a fixed
 * duration (so SSR and first client render match), then ticks down each second.
 */
export function Countdown({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  const [total, setTotal] = useState(hours * 3600 + minutes * 60 + seconds);

  useEffect(() => {
    const id = setInterval(
      () => setTotal((t) => (t > 0 ? t - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const box =
    "inline-flex min-w-[28px] items-center justify-center rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-sm font-semibold tabular-nums text-warn dark:text-gold";

  return (
    <span
      className="inline-flex items-center gap-1"
      dir="ltr"
      role="timer"
      aria-label={`${pad(h)}:${pad(m)}:${pad(s)}`}
    >
      <span className={box}>{pad(h)}</span>
      <span className="text-muted">:</span>
      <span className={box}>{pad(m)}</span>
      <span className="text-muted">:</span>
      <span className={box}>{pad(s)}</span>
    </span>
  );
}
