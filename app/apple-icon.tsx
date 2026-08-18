import { ImageResponse } from "next/og";

// Home-screen icon: "B" mark over the B-Wave, set as American Blue on Mikado
// Yellow — the primary/secondary pairing from the guide (Secondary logo 10).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(140deg, #ffbe12 0%, #e0a710 100%)",
          color: "#402f75",
        }}
      >
        <div style={{ display: "flex", fontSize: 108, fontWeight: 800, lineHeight: 1 }}>
          B
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          {[10, 18, 26, 18, 10].map((h, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: h,
                borderRadius: 999,
                background: "#402f75",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
