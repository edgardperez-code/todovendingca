"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Gauge, Loader2, Save, Trash2 } from "lucide-react";
import { AuditReport } from "@/components/site/audit-report";
import { api, splitList } from "@/lib/client-api";
import type { Project } from "@/lib/types";
import { formatDate, slugify } from "@/lib/utils";

export function ProjectEditor({ project }: { project?: Project | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: project?.name ?? "",
    slug: project?.slug ?? "",
    slugTouched: Boolean(project),
    url: project?.url ?? "https://",
    description: project?.description ?? "",
    services: project?.services.join(", ") ?? "",
    imageUrl: project?.imageUrl ?? "",
    featured: project?.featured ?? false,
    launchedAt: project?.launchedAt ? project.launchedAt.slice(0, 10) : "",
    status: project?.status ?? "published",
    sortOrder: project?.sortOrder ?? 0,
  });
  const [current, setCurrent] = useState<Project | null>(project ?? null);
  const [busy, setBusy] = useState<"save" | "audit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const payload = () => ({
    name: form.name.trim(),
    slug: slugify(form.slug || form.name),
    url: form.url.trim(),
    description: form.description.trim(),
    services: splitList(form.services),
    imageUrl: form.imageUrl.trim() || null,
    featured: form.featured,
    launchedAt: form.launchedAt ? new Date(form.launchedAt).toISOString() : null,
    status: form.status as "published" | "hidden",
    sortOrder: Number(form.sortOrder) || 0,
  });

  async function save(thenAudit = false) {
    setBusy("save");
    setError(null);
    setNotice(null);
    try {
      let saved: Project;
      if (current) {
        saved = (await api<{ project: Project }>(`/api/admin/projects/${current.id}`, { method: "PUT", json: payload() })).project;
      } else {
        saved = (await api<{ project: Project }>("/api/admin/projects", { method: "POST", json: payload() })).project;
      }
      setCurrent(saved);
      setNotice("Proyecto guardado.");
      if (thenAudit) await audit(saved.id);
      if (!current) router.replace(`/admin/proyectos/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function audit(id = current?.id) {
    if (!id) return;
    setBusy("audit");
    setError(null);
    try {
      const res = await api<{ project: Project }>(`/api/admin/projects/${id}/audit`, { method: "POST" });
      setCurrent(res.project);
      setNotice(res.project.audit?.error ? `La auditoría no pudo completarse: ${res.project.audit.error}` : `Auditoría completada: ${res.project.auditScore}/100.`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!current || !confirm("¿Eliminar este proyecto del portafolio?")) return;
    await api(`/api/admin/projects/${current.id}`, { method: "DELETE" });
    router.push("/admin/proyectos");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">{current ? "Editar proyecto" : "Nuevo proyecto"}</h1>
          {current?.auditedAt && <p className="text-sm text-ink-500">Última auditoría: {formatDate(current.auditedAt)} · {current.auditScore ?? "—"}/100</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {current && <Link href={`/portafolio/${current.slug}`} target="_blank" className="btn-secondary !py-2"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver</Link>}
          {current && (
            <button type="button" onClick={() => audit()} disabled={busy !== null} className="btn-secondary !py-2">
              {busy === "audit" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Gauge className="h-4 w-4" aria-hidden="true" />} Auditar ahora
            </button>
          )}
          <button type="button" onClick={() => save(!current)} disabled={busy !== null} className="btn-primary !py-2">
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />} {current ? "Guardar" : "Guardar y auditar"}
          </button>
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Nombre del proyecto *</label>
              <input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : slugify(e.target.value) }))} className="input" />
            </div>
            <div>
              <label htmlFor="slug" className="label">Slug *</label>
              <input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} onBlur={() => setForm((f) => ({ ...f, slug: slugify(f.slug) }))} className="input font-mono text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="url" className="label">URL pública del sitio *</label>
            <input id="url" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input font-mono text-sm" />
          </div>
          <div>
            <label htmlFor="description" className="label">Descripción (qué hicimos, para quién, con qué resultado)</label>
            <textarea id="description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
          </div>
          <div>
            <label htmlFor="services" className="label">Servicios aplicados (coma)</label>
            <input id="services" value={form.services} onChange={(e) => setForm({ ...form, services: e.target.value })} className="input" placeholder="Diseño web, SEO, GEO/IAO" />
          </div>
          <div>
            <label htmlFor="imageUrl" className="label">Imagen o captura (URL o ruta /portafolio/archivo.jpg)</label>
            <input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input font-mono text-sm" placeholder="Si se deja vacío se muestra una tarjeta generada" />
          </div>
        </div>
        <aside className="space-y-5">
          <div className="card space-y-4 p-6">
            <div>
              <label htmlFor="status" className="label">Visibilidad</label>
              <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "published" | "hidden" })} className="input">
                <option value="published">Publicado</option>
                <option value="hidden">Oculto</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destacar en la portada</label>
            <div>
              <label htmlFor="launchedAt" className="label">Fecha de publicación del sitio</label>
              <input id="launchedAt" type="date" value={form.launchedAt} onChange={(e) => setForm({ ...form, launchedAt: e.target.value })} className="input" />
            </div>
            <div>
              <label htmlFor="sortOrder" className="label">Orden (menor = primero)</label>
              <input id="sortOrder" type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input" />
            </div>
          </div>
          {current && <button type="button" onClick={remove} className="btn w-full border border-red-200 bg-white text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar proyecto</button>}
        </aside>
      </div>

      {current?.audit && (
        <section>
          <h2 className="font-display text-xl font-extrabold text-ink-900">Resultado de la auditoría</h2>
          <div className="mt-4"><AuditReport audit={current.audit} /></div>
        </section>
      )}
    </div>
  );
}
