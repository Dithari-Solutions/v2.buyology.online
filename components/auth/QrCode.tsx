import { BagIcon } from "@/components/icons";

/**
 * Decorative, QR-style code for the "log in with the app" flow. The module
 * pattern is generated deterministically (a stable hash of the cell position),
 * so it renders identically on the server and client — it does not encode real
 * data (this is a UI-only mock). A branded mark sits in the cleared centre.
 */

const N = 29; // modules per side

function finderCell(x: number, y: number): boolean | null {
  const local = (ox: number, oy: number): boolean | null => {
    const lx = x - ox;
    const ly = y - oy;
    if (lx < 0 || lx > 6 || ly < 0 || ly > 6) return null;
    const border = lx === 0 || lx === 6 || ly === 0 || ly === 6;
    const inner = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
    return border || inner;
  };
  const a = local(0, 0);
  if (a !== null) return a;
  const b = local(N - 7, 0);
  if (b !== null) return b;
  const c = local(0, N - 7);
  if (c !== null) return c;
  return null;
}

function nearFinder(x: number, y: number): boolean {
  const zone = (ox: number, oy: number) =>
    x >= ox - 1 && x <= ox + 7 && y >= oy - 1 && y <= oy + 7;
  return zone(0, 0) || zone(N - 7, 0) || zone(0, N - 7);
}

function dataOn(x: number, y: number): boolean {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = (h * 1274126177) >>> 0;
  return h % 1000 < 460; // ~46% module density
}

export function QrCode({ size = 176 }: { size?: number }) {
  const center = (N - 1) / 2;
  const rects: React.ReactElement[] = [];

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let on = false;
      const f = finderCell(x, y);
      if (f !== null) {
        on = f;
      } else if (nearFinder(x, y)) {
        on = false; // quiet separator around finders
      } else if (Math.abs(x - center) <= 3 && Math.abs(y - center) <= 3) {
        on = false; // cleared centre for the brand mark
      } else {
        on = dataOn(x, y);
      }
      if (on) {
        rects.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} rx={0.3} />,
        );
      }
    }
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox={`-2 -2 ${N + 4} ${N + 4}`}
        className="h-full w-full"
        role="img"
        aria-label="QR login code"
      >
        <rect x={-2} y={-2} width={N + 4} height={N + 4} rx={3} fill="#ffffff" />
        <g fill="#2e1065">{rects}</g>
      </svg>
      <span className="absolute left-1/2 top-1/2 flex h-[21%] w-[21%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-brand text-white ring-4 ring-white">
        <BagIcon className="h-1/2 w-1/2" />
      </span>
    </div>
  );
}
