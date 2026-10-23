import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  id,
  as: Tag = "h2",
  dark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  id?: string;
  as?: "h1" | "h2" | "h3";
  dark?: boolean;
}) {
  const center = align === "center";
  return (
    <div className={`reveal max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className={`eyebrow ${center ? "justify-center" : ""} ${dark ? "text-brand-amber" : ""}`}>{eyebrow}</p>
      )}
      <Tag id={id} className={`mt-3 text-display-md ${dark ? "text-white" : ""}`}>
        {title}
      </Tag>
      {lead && (
        <p className={`mt-4 text-lg leading-relaxed ${dark ? "text-white/75" : "text-muted-foreground"}`}>{lead}</p>
      )}
    </div>
  );
}
