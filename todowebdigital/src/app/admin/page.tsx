import { redirect } from "next/navigation";
import { LogoMark } from "@/components/ui/logo";
import { LoginForm } from "@/components/admin/login-form";
import { adminConfigured, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/panel");
  const configured = adminConfigured();
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-950 px-4">
      <div className="bg-glow absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-ink-900/80 p-8 text-white shadow-[var(--shadow-glow)] backdrop-blur">
        <div className="flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div>
            <p className="font-display text-lg font-extrabold">TodoWeb Digital</p>
            <p className="text-xs text-ink-400">Panel de administración</p>
          </div>
        </div>
        {configured ? (
          <LoginForm />
        ) : (
          <div className="mt-6 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-200">
            <p className="font-semibold">El panel no está configurado.</p>
            <p className="mt-1">Define la variable de entorno <code className="font-mono">ADMIN_PASSWORD</code> (mínimo 8 caracteres) y, opcionalmente, <code className="font-mono">SESSION_SECRET</code>. Luego recarga esta página.</p>
          </div>
        )}
        <p className="mt-6 text-center text-xs text-ink-500"><a href="/" className="hover:text-white">← Volver al sitio</a></p>
      </div>
    </main>
  );
}
