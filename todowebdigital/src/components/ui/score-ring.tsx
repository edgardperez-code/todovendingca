import { cn, scoreLabel } from "@/lib/utils";

const toneColor = { good: "#22c55e", ok: "#f59e0b", bad: "#ef4444" } as const;

export function ScoreRing({ score, size = 96, label, className, dark = false }: { score: number | null; size?: number; label?: string; className?: string; dark?: boolean }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const value = score ?? 0;
  const tone = score == null ? "bad" : scoreLabel(score).tone;
  const color = score == null ? (dark ? "#45577f" : "#a3b0c9") : toneColor[tone];
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${label ?? "Puntuación"}: ${score == null ? "pendiente" : `${score} de 100`}`}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.08)" : "#e9edf5"} strokeWidth={8} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (c * value) / 100}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-display font-extrabold", dark ? "text-white" : "text-ink-900")} style={{ fontSize: size * 0.28 }}>
            {score == null ? "—" : score}
          </span>
        </div>
      </div>
      {label && <span className={cn("text-xs font-medium", dark ? "text-ink-300" : "text-ink-500")}>{label}</span>}
    </div>
  );
}
