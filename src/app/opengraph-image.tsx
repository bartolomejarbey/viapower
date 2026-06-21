import { ImageResponse } from "next/og";

// Default social-share card for the whole site (Next auto-injects og:image + twitter:image).
export const alt = "Viapower — Fotovoltaika, baterie a tepelná čerpadla na klíč";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090b",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 18, height: 18, background: "#c00f0a" }} />
          <div style={{ color: "#9aa0a6", fontSize: 26, letterSpacing: 6, textTransform: "uppercase" }}>
            Komplexní partner v energetice
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#ffffff", fontSize: 104, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>
            VIAPOWER
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 14px", fontSize: 46, fontWeight: 700, lineHeight: 1.1, marginTop: 18 }}>
            <span style={{ color: "#e6e7e8" }}>Fotovoltaika, baterie a tepelná čerpadla</span>
            <span style={{ color: "#e8201a" }}>na klíč.</span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ color: "#9aa0a6", fontSize: 28 }}>15+ let zkušeností · stovky realizací · dotace až 160 000 Kč</div>
          <div style={{ color: "#6b7177", fontSize: 26 }}>viapower.cz</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
