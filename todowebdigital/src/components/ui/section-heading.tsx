import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, text, align = "left", dark = false, as: Tag = "h2", className }: { eyebrow?: string; title: string; text?: string; align?: "left" | "center"; dark?: boolean; as?: "h1" | "h2" | "h3"; className?: string }) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <span className={dark ? "eyebrow-light" : "eyebrow"}>{eyebrow}</span>}
      <Tag className={cn("font-display mt-4 text-3xl font-extrabold leading-[1.1] sm:text-4xl lg:text-5xl", dark ? "text-white" : "text-ink-900")}>{title}</Tag>
      {text && <p className={cn("mt-5 text-lg leading-8", dark ? "text-ink-300" : "text-ink-600")}>{text}</p>}
    </div>
  );
}
