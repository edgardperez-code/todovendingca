import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { StickyCTA } from "./sticky-cta";
import type { WaMessageKey } from "@shared/site";

export function PageShell({
  children,
  waKey = "home",
  currentPath,
  testId,
}: {
  children: ReactNode;
  waKey?: WaMessageKey;
  currentPath?: string;
  testId?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background" data-testid={testId}>
      <SiteHeader waKey={waKey} currentPath={currentPath} />
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      <SiteFooter />
      <StickyCTA waKey={waKey} />
    </div>
  );
}
