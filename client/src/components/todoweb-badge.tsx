// Insignia oficial "Hecho por TodoWeb Digital" (repo edgardperez-code/todowebdigital, BADGE.md).
const FONT = "'Plus Jakarta Sans',Inter,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export function TodoWebBadge({ tema = "claro" }: { tema?: "claro" | "oscuro" }) {
  const c =
    tema === "claro"
      ? { bg: "#ffffff", border: "#cbd5e1", label: "#64748b", name: "#0a1226", accent: "#2563eb" }
      : { bg: "#0a1226", border: "rgba(255,255,255,.16)", label: "#94a3b8", name: "#ffffff", accent: "#22d3ee" };
  return (
    <a
      href="https://www.todowebdigital.com"
      target="_blank"
      rel="noopener"
      title="TodoWeb Digital: diseño de páginas web"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 6px", border: `1px solid ${c.border}`, borderRadius: 999, background: c.bg, textDecoration: "none", fontFamily: FONT, lineHeight: 1, verticalAlign: "middle" }}
    >
      <svg width="26" height="26" viewBox="0 0 48 48" aria-hidden="true" style={{ flex: "none", display: "block" }}>
        <defs>
          <linearGradient id="twdBadgeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="60%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#twdBadgeGrad)" />
        <path d="M12 16l6 16 6-11 6 11 6-16" fill="none" stroke="#050a18" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="36" cy="13" r="3" fill="#050a18" />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: c.label }}>Hecho por</span>
        <span style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: "-.01em", color: c.name }}>
          TodoWeb <span style={{ color: c.accent }}>Digital</span>
        </span>
      </span>
    </a>
  );
}
