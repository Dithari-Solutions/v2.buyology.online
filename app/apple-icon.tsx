import { ImageResponse } from "next/og";

// Home-screen icon: larger "B" mark with the signature gold wave beneath it.
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
          background: "linear-gradient(140deg, #402f75 0%, #2e1065 60%, #e5a800 150%)",
          color: "#ffffff",
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
                background: "#fbbb14",
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
