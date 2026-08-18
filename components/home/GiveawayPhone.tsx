/**
 * Prize artwork for the giveaway banner: a deep-plum flagship handset, drawn
 * as vector so it stays sharp at any size and ships no image weight.
 *
 * Deliberately a stylised rendition rather than a product photograph — the
 * iPhone 18 Pro is unannounced, so there is no official imagery to use.
 */
export function GiveawayPhone({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 580"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <defs>
        {/* Anodised plum body, lit from the upper left. */}
        <linearGradient id="gp-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8A5C80" />
          <stop offset="18%" stopColor="#6E4867" />
          <stop offset="52%" stopColor="#4A2B42" />
          <stop offset="100%" stopColor="#2A1626" />
        </linearGradient>

        {/* Brighter rail that catches the light along the top-left edge. */}
        <linearGradient id="gp-rail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B98CAF" stopOpacity=".95" />
          <stop offset="30%" stopColor="#7E5476" stopOpacity=".5" />
          <stop offset="70%" stopColor="#3A2033" stopOpacity=".35" />
          <stop offset="100%" stopColor="#A87E9E" stopOpacity=".55" />
        </linearGradient>

        <linearGradient id="gp-plateau" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#7E5476" />
          <stop offset="55%" stopColor="#5C3A56" />
          <stop offset="100%" stopColor="#3E2338" />
        </linearGradient>

        <linearGradient id="gp-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9C7292" />
          <stop offset="45%" stopColor="#4A2B42" />
          <stop offset="100%" stopColor="#22101E" />
        </linearGradient>

        {/* Lens glass: near-black with a cold blue catchlight. */}
        <radialGradient id="gp-glass" cx="0.34" cy="0.28" r="0.85">
          <stop offset="0%" stopColor="#4E6E9B" />
          <stop offset="22%" stopColor="#1B2436" />
          <stop offset="70%" stopColor="#0C0710" />
          <stop offset="100%" stopColor="#05030A" />
        </radialGradient>

        <radialGradient id="gp-flash" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0%" stopColor="#FFFDF6" />
          <stop offset="55%" stopColor="#EDE2CB" />
          <stop offset="100%" stopColor="#9C8E76" />
        </radialGradient>

        {/* Sheen sweeping across the lower back. */}
        <linearGradient id="gp-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity=".10" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity=".02" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Body */}
      <rect x="4" y="4" width="272" height="572" rx="58" fill="url(#gp-body)" />
      <rect
        x="4"
        y="4"
        width="272"
        height="572"
        rx="58"
        fill="none"
        stroke="url(#gp-rail)"
        strokeWidth="3"
      />
      <rect x="14" y="14" width="252" height="552" rx="50" fill="url(#gp-sheen)" />

      {/* Side button (left rail) */}
      <rect x="1" y="150" width="5" height="64" rx="2.5" fill="#3E2338" />
      <rect x="1" y="150" width="2" height="64" rx="1" fill="#A87E9E" opacity=".5" />

      {/* Camera plateau */}
      <g>
        <rect x="22" y="22" width="230" height="172" rx="46" fill="url(#gp-plateau)" />
        <rect
          x="22"
          y="22"
          width="230"
          height="172"
          rx="46"
          fill="none"
          stroke="#B98CAF"
          strokeOpacity=".38"
          strokeWidth="1.5"
        />

        {/* Three lenses, triangular cluster */}
        {[
          { cx: 82, cy: 80 },
          { cx: 152, cy: 114 },
          { cx: 82, cy: 150 },
        ].map((l) => (
          <g key={`${l.cx}-${l.cy}`}>
            <circle cx={l.cx} cy={l.cy} r="33" fill="url(#gp-ring)" />
            <circle
              cx={l.cx}
              cy={l.cy}
              r="33"
              fill="none"
              stroke="#C79BBD"
              strokeOpacity=".45"
              strokeWidth="1.4"
            />
            <circle cx={l.cx} cy={l.cy} r="25" fill="#160A13" />
            <circle cx={l.cx} cy={l.cy} r="21" fill="url(#gp-glass)" />
            {/* Specular highlight */}
            <ellipse
              cx={l.cx - 7}
              cy={l.cy - 9}
              rx="6.5"
              ry="4.5"
              fill="#ffffff"
              opacity=".5"
              transform={`rotate(-35 ${l.cx - 7} ${l.cy - 9})`}
            />
          </g>
        ))}

        {/* Flash, mic, LiDAR */}
        <circle cx="214" cy="80" r="15" fill="#2A1626" />
        <circle cx="214" cy="80" r="11" fill="url(#gp-flash)" />
        <circle cx="214" cy="118" r="3.5" fill="#1B0E18" />
        <circle cx="214" cy="152" r="12" fill="#180B15" />
        <circle cx="214" cy="152" r="8" fill="#0A050C" />
        <circle cx="211" cy="149" r="2.5" fill="#6E8CB5" opacity=".55" />
      </g>

      {/* MagSafe ring, barely there */}
      <circle
        cx="140"
        cy="360"
        r="72"
        fill="none"
        stroke="#ffffff"
        strokeOpacity=".07"
        strokeWidth="14"
      />
    </svg>
  );
}
