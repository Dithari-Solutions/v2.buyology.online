import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * Shared Open Graph / Twitter card image, generated at the edge via satori.
 * Used by both app/opengraph-image.tsx and app/twitter-image.tsx so the two
 * stay identical. 1200x630 is the standard large-card size.
 *
 * Note: only divs + inline styles are used (no inline <svg>) because satori
 * supports a limited CSS subset; the gold "waveform" is a row of rounded bars
 * that echoes the brand mark and the voice-search equalizer.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const WAVE = [22, 40, 64, 92, 120, 92, 64, 40, 26, 40, 64, 96, 120, 88, 56, 34];

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(1100px 520px at 80% -10%, #402f75 0%, #2b1f52 45%, #000000 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "linear-gradient(135deg, #ffbe12 0%, #e0a710 130%)",
              fontSize: 52,
              fontWeight: 800,
              color: "#000000",
            }}
          >
            B
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#ffbe12",
              fontWeight: 700,
            }}
          >
            {site.tagline}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            Buyology
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "rgba(255,255,255,0.82)",
              maxWidth: 900,
            }}
          >
            120,000+ future products — voice search, an AI assistant, and
            complimentary orbital delivery.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
            {WAVE.map((h, i) => (
              <div
                key={i}
                style={{
                  width: 12,
                  height: h,
                  borderRadius: 999,
                  background: "linear-gradient(180deg, #ffbe12 0%, #e0a710 100%)",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#ffbe12", fontWeight: 600 }}>
            {site.domain}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
