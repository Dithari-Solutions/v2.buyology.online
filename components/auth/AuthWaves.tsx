/**
 * The brand's wave, repeated into a field.
 *
 * The single gold wave under the logo is the one mark Buyology already signs everything with —
 * it sits beneath the wordmark in every transactional email. This takes that exact curve and
 * layers it: five passes at different wavelengths and depths, each drifting at its own speed, so
 * the panel reads as one brand gesture at scale rather than as decoration applied on top of a
 * gradient.
 *
 * Why it replaced what was here: two blurred colour orbs, which is the house style of every
 * generated auth page and says nothing about this company. It also had the brand backwards —
 * the guidelines make Mikado Yellow the dominant colour and American Blue the support, while the
 * panel was purple wall-to-wall with gold as a garnish.
 *
 * Each path spans well past the viewBox and shifts by exactly one wavelength, so the loop closes
 * on itself with no visible seam. Drift is suppressed by the global reduced-motion rule.
 */

type Wave = {
  /** Vertical centre of this pass, in viewBox units. */
  baseline: number;
  amplitude: number;
  wavelength: number;
  width: number;
  opacity: number;
  /** Seconds for one full wavelength of travel — slower reads as further away. */
  duration: number;
};

const VIEW_W = 1200;
const VIEW_H = 800;

/**
 * The field owns the bottom third and nothing else, which is what lets it be bold. Spread over the
 * whole panel, the faint upper passes cut straight through the headline — thin gold rules across
 * running text read as scratches on the screen, not as artwork behind it. Confined below the copy,
 * the same strokes can carry full weight and become the floor the panel stands on.
 *
 * Amplitudes deliberately do not step evenly, and the bands overlap: five near-parallel curves
 * read as a contour map, which is a duller idea than a wave.
 */
const WAVES: Wave[] = [
  { baseline: 592, amplitude: 34, wavelength: 430, width: 1.5, opacity: 0.26, duration: 27 },
  { baseline: 638, amplitude: 60, wavelength: 580, width: 2, opacity: 0.42, duration: 34 },
  { baseline: 678, amplitude: 28, wavelength: 320, width: 2.5, opacity: 0.60, duration: 18 },
  { baseline: 722, amplitude: 52, wavelength: 490, width: 3.5, opacity: 0.82, duration: 30 },
  // Sits clear of the bottom edge on purpose. On the baseline it started from, the viewBox floor
  // sliced it in half and left a sliver peeking in, which reads as a crop bug rather than water.
  { baseline: 766, amplitude: 40, wavelength: 640, width: 4.5, opacity: 1, duration: 42 },
];

/**
 * One S-curve per wavelength — the same shape as the wordmark's wave, not a generic sine.
 * The path runs past the right edge by a full wavelength so the shifted copy always covers it.
 */
function wavePath({ baseline, amplitude, wavelength }: Wave): string {
  const repeats = Math.ceil((VIEW_W + wavelength) / wavelength) + 1;
  let d = `M0,${baseline}`;
  for (let i = 0; i < repeats; i++) {
    const x = i * wavelength;
    d += ` C${x + wavelength * 0.25},${baseline - amplitude}`
      + ` ${x + wavelength * 0.75},${baseline + amplitude}`
      + ` ${x + wavelength},${baseline}`;
  }
  return d;
}

export function AuthWaves() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{
        // A straight horizontal fade, not a diagonal one. The diagonal version protected the copy
        // but took the field's weight with it, leaving a faint texture in one corner rather than a
        // floor. This keeps the strokes at full strength and simply starts them below the text.
        maskImage: "linear-gradient(to bottom, transparent 48%, #000 66%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 48%, #000 66%)",
      }}
    >
      <defs>
        {/* Light coming up through the waves, anchored where they crowd together — a glow tied
            to the artwork rather than an orb floating behind it. Kept low and to the right: gold
            laid thickly over purple turns brown, and it did exactly that under the review line. */}
        <radialGradient id="auth-wave-glow" cx="46%" cy="100%" r="56%">
          <stop offset="0%" stopColor="#ffbe12" stopOpacity="0.22" />
          <stop offset="55%" stopColor="#ffbe12" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffbe12" stopOpacity="0" />
        </radialGradient>
        {/* Every stroke fades out toward the right so the field never fights the form panel. */}
        <linearGradient id="auth-wave-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffcb41" />
          <stop offset="62%" stopColor="#ffbe12" />
          <stop offset="100%" stopColor="#ffbe12" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <rect width={VIEW_W} height={VIEW_H} fill="url(#auth-wave-glow)" />

      {WAVES.map((wave) => (
        <g
          key={wave.baseline}
          className="buyo-wave-line"
          style={{
            ["--wave-shift" as string]: `${-wave.wavelength}px`,
            animationDuration: `${wave.duration}s`,
          }}
        >
          <path
            d={wavePath(wave)}
            fill="none"
            stroke="url(#auth-wave-stroke)"
            strokeWidth={wave.width}
            strokeLinecap="round"
            opacity={wave.opacity}
          />
        </g>
      ))}
    </svg>
  );
}
