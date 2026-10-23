import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoMark } from "@/components/ui/logo";
import { isAdmin } from "@/lib/auth";
import { getRepo } from "@/lib/db/repo";
import { aiConfigured } from "@/lib/ai";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin");
  const repo = getRepo();
  const warnings: string[] = [];
  if (repo.kind === "json") warnings.push("Sin base de datos (DATABASE_URL): los cambios se guardan en data/store.json y se perderán al redesplegar.");
  if (!aiConfigured()) warnings.push("Sin ANTHROPIC_API_KEY: la generación de artículos con IA está desactivada.");

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="flex w-full flex-col border-b border-ink-200 bg-white lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2.5 px-5 py-4">
          <LogoMark className="h-8 w-8" />
          <div>
            <p className="font-display text-sm font-extrabold text-ink-900">TodoWeb Digital</p>
            <p className="text-[11px] text-ink-500">Panel de administración</p>
          </div>
        </div>
        <AdminNav />
      </aside>
      <div className="flex-1">
        {warnings.length > 0 && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-900">
            {warnings.map((w) => (
              <p key={w} className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{w}</p>
            ))}
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
