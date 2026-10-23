import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("h-9 w-9", className)}>
      <defs>
        <linearGradient id="twd-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="60%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#twd-g)" />
      <path d="M12 16l6 16 6-11 6 11 6-16" fill="none" stroke="#050a18" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36" cy="13" r="3" fill="#050a18" />
    </svg>
  );
}

export function Logo({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)} aria-label="TodoWeb Digital, inicio">
      <LogoMark />
      <span className={cn("font-display text-lg font-extrabold tracking-tight", dark ? "text-white" : "text-ink-900")}>
        TodoWeb<span className="text-gradient"> Digital</span>
      </span>
    </Link>
  );
}
