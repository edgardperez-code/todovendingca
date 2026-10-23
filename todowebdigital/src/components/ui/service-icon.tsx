import { LayoutTemplate, Search, Sparkles, Rocket, ShoppingBag, Wrench } from "lucide-react";
import type { ServiceDef } from "@/lib/site";

const icons = { layout: LayoutTemplate, search: Search, sparkles: Sparkles, rocket: Rocket, "shopping-bag": ShoppingBag, wrench: Wrench } as const;

export function ServiceIcon({ icon, className = "h-6 w-6" }: { icon: ServiceDef["icon"]; className?: string }) {
  const Icon = icons[icon];
  return <Icon className={className} aria-hidden="true" />;
}
