import { ImageResponse } from "next/og";

// Imagen Open Graph (1200x630) generada al vuelo con la marca.
// Se usa para la portada, artículos del blog y proyectos del portafolio.
export function brandOgImage({ eyebrow, title, subtitle, badge }: { eyebrow: string; title: string; subtitle?: string; badge?: string }) {
  const safeTitle = title.length > 95 ? title.slice(0, 92) + "…" : title;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #050a18 0%, #0a1226 55%, #111b35 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -120, right: -80, width: 460, height: 460, borderRadius: 999, background: "radial-gradient(circle, rgba(37,99,235,0.55), transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: -160, left: 120, width: 520, height: 520, borderRadius: 999, background: "radial-gradient(circle, rgba(6,182,212,0.35), transparent 65%)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#3b82f6,#22d3ee 60%,#a3e635)", display: "flex", alignItems: "center", justifyContent: "center", color: "#050a18", fontSize: 30, fontWeight: 800 }}>W</div>
            <div style={{ display: "flex", gap: 10, fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>
              <span>TodoWeb</span>
              <span style={{ color: "#67e8f9" }}>Digital</span>
            </div>
          </div>
          {badge && (
            <div style={{ fontSize: 22, fontWeight: 700, padding: "10px 22px", borderRadius: 999, border: "1px solid rgba(163,230,53,0.5)", color: "#bef264", background: "rgba(163,230,53,0.1)" }}>{badge}</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: "#67e8f9" }}>{eyebrow}</div>
          <div style={{ fontSize: safeTitle.length > 60 ? 54 : 66, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, maxWidth: 1040 }}>{safeTitle}</div>
          {subtitle && <div style={{ fontSize: 26, color: "#a3b0c9", lineHeight: 1.35, maxWidth: 1000 }}>{subtitle.length > 150 ? subtitle.slice(0, 147) + "…" : subtitle}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#7384a6" }}>
          <span>www.todowebdigital.com</span>
          <span>Diseño web · SEO · GEO · IAO</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
