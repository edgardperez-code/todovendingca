"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, Loader2, Plus, Save, Sparkles, Trash2, Wand2, X, ExternalLink } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { api, splitList } from "@/lib/client-api";
import type { FaqItem, Post } from "@/lib/types";
import { slugify } from "@/lib/utils";

type Form = {
  title: string;
  slug: string;
  slugTouched: boolean;
  category: string;
  tags: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  coverImage: string;
  content: string;
  faq: FaqItem[];
  status: "draft" | "published";
  generatedByAi: boolean;
  prompt: string;
};

function fromPost(p?: Post | null): Form {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    slugTouched: Boolean(p),
    category: p?.category ?? "Diseño web",
    tags: p?.tags.join(", ") ?? "",
    excerpt: p?.excerpt ?? "",
    metaTitle: p?.metaTitle ?? "",
    metaDescription: p?.metaDescription ?? "",
    keywords: p?.keywords.join(", ") ?? "",
    coverImage: p?.coverImage ?? "",
    content: p?.content ?? "",
    faq: p?.faq ?? [],
    status: p?.status ?? "draft",
    generatedByAi: p?.generatedByAi ?? false,
    prompt: p?.prompt ?? "",
  };
}

type GenResponse = {
  article: { title: string; slug: string; excerpt: string; metaTitle: string; metaDescription: string; category: string; tags: string[]; keywords: string[]; content: string; faq: FaqItem[] };
  usage: { input: number; output: number };
  model: string;
};

export function ArticleEditor({ post, aiEnabled, model }: { post?: Post | null; aiEnabled: boolean; model: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(() => fromPost(post));
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Generador IA
  const [showAi, setShowAi] = useState(!post);
  const [gen, setGen] = useState({ prompt: "", tone: "profesional", length: "medio", keywords: "", audience: "", category: "" });
  const [generating, setGenerating] = useState(false);
  const [genInfo, setGenInfo] = useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const words = useMemo(() => form.content.split(/\s+/).filter(Boolean).length, [form.content]);

  function onTitle(v: string) {
    setForm((f) => ({ ...f, title: v, slug: f.slugTouched ? f.slug : slugify(v) }));
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    setGenInfo(null);
    try {
      const res = await api<GenResponse>("/api/admin/posts/generate", {
        method: "POST",
        json: { prompt: gen.prompt, tone: gen.tone, length: gen.length, keywords: splitList(gen.keywords), audience: gen.audience || undefined, category: gen.category || undefined },
      });
      const a = res.article;
      setForm((f) => ({
        ...f,
        title: a.title,
        slug: slugify(a.slug || a.title),
        slugTouched: true,
        category: a.category,
        tags: a.tags.join(", "),
        excerpt: a.excerpt,
        metaTitle: a.metaTitle,
        metaDescription: a.metaDescription,
        keywords: a.keywords.join(", "),
        content: a.content,
        faq: a.faq,
        generatedByAi: true,
        prompt: gen.prompt,
      }));
      setGenInfo(`Generado con ${res.model} · ${res.usage.input.toLocaleString()} tokens de entrada, ${res.usage.output.toLocaleString()} de salida. Revísalo antes de publicar.`);
      setShowAi(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function save(status: "draft" | "published") {
    setSaving(true);
    setError(null);
    setNotice(null);
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      category: form.category.trim() || "General",
      tags: splitList(form.tags),
      excerpt: form.excerpt.trim() || undefined,
      metaTitle: form.metaTitle.trim() || null,
      metaDescription: form.metaDescription.trim() || null,
      keywords: splitList(form.keywords),
      coverImage: form.coverImage.trim() || null,
      content: form.content,
      faq: form.faq.filter((f) => f.q.trim() && f.a.trim()),
      status,
      generatedByAi: form.generatedByAi,
      prompt: form.prompt || null,
    };
    try {
      if (post) {
        await api(`/api/admin/posts/${post.id}`, { method: "PUT", json: payload });
        setNotice(status === "published" ? "Artículo publicado." : "Cambios guardados.");
        setForm((f) => ({ ...f, status }));
        router.refresh();
      } else {
        const res = await api<{ post: Post }>("/api/admin/posts", { method: "POST", json: payload });
        router.push(`/admin/articulos/${res.post.id}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!post || !confirm("¿Eliminar este artículo? Esta acción no se puede deshacer.")) return;
    await api(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    router.push("/admin/articulos");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">{post ? "Editar artículo" : "Nuevo artículo"}</h1>
          <p className="text-sm text-ink-500">{post ? `Estado: ${form.status === "published" ? "publicado" : "borrador"} · ${words} palabras` : "Genera el contenido con IA o escríbelo tú."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {post?.status === "published" && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="btn-secondary !py-2"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver</Link>
          )}
          <button type="button" onClick={() => setShowAi((v) => !v)} className="btn-secondary !py-2"><Sparkles className="h-4 w-4" aria-hidden="true" /> {showAi ? "Ocultar IA" : "Generar con IA"}</button>
          <button type="button" onClick={() => save("draft")} disabled={saving} className="btn-secondary !py-2"><Save className="h-4 w-4" aria-hidden="true" /> Guardar borrador</button>
          <button type="button" onClick={() => save("published")} disabled={saving} className="btn-primary !py-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null} Publicar</button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</p>}
      {genInfo && <p role="status" className="rounded-xl bg-electric-500/10 px-4 py-3 text-sm text-electric-700">{genInfo}</p>}

      {showAi && (
        <section className="rounded-3xl bg-ink-950 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow-light"><Wand2 className="h-3.5 w-3.5" aria-hidden="true" /> Generador con Claude</p>
              <h2 className="font-display mt-3 text-xl font-extrabold">Describe el artículo que quieres</h2>
              <p className="mt-1 text-sm text-ink-300">Ejemplo: “Guía para dueños de restaurantes en Venezuela sobre cómo aparecer en Google Maps y en ChatGPT, con pasos concretos y errores comunes”.</p>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-ink-300">{model}</span>
          </div>
          {!aiEnabled && <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">Falta la variable ANTHROPIC_API_KEY. Agrégala en el servidor para activar la generación.</p>}
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <label htmlFor="gen-prompt" className="mb-1.5 block text-sm font-medium text-ink-200">Tema e instrucciones *</label>
              <textarea id="gen-prompt" rows={6} value={gen.prompt} onChange={(e) => setGen({ ...gen, prompt: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-ink-500 focus:border-electric-400 focus:outline-none" placeholder="Sobre qué quieres el artículo, para quién, qué debe incluir..." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-200" htmlFor="gen-tone">Tono</label>
                <select id="gen-tone" value={gen.tone} onChange={(e) => setGen({ ...gen, tone: e.target.value })} className="w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white">
                  <option value="profesional">Profesional</option>
                  <option value="cercano">Cercano</option>
                  <option value="didactico">Didáctico</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-200" htmlFor="gen-length">Extensión</label>
                <select id="gen-length" value={gen.length} onChange={(e) => setGen({ ...gen, length: e.target.value })} className="w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2.5 text-sm text-white">
                  <option value="corto">Corto (700-900 palabras)</option>
                  <option value="medio">Medio (1200-1600)</option>
                  <option value="largo">Largo (1900-2500)</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-ink-200" htmlFor="gen-keywords">Palabras clave (opcional, separadas por coma)</label>
                <input id="gen-keywords" value={gen.keywords} onChange={(e) => setGen({ ...gen, keywords: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-ink-500" placeholder="diseño web, SEO local, ..." />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-200" htmlFor="gen-audience">Público (opcional)</label>
                <input id="gen-audience" value={gen.audience} onChange={(e) => setGen({ ...gen, audience: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-ink-500" placeholder="Dueños de pymes" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-200" htmlFor="gen-category">Categoría (opcional)</label>
                <input id="gen-category" value={gen.category} onChange={(e) => setGen({ ...gen, category: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-ink-500" placeholder="SEO" />
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={generate} disabled={generating || !aiEnabled || gen.prompt.trim().length < 10} className="btn-primary">
              {generating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              {generating ? "Generando (puede tardar 1-3 minutos)..." : "Generar artículo"}
            </button>
            {form.content && <span className="text-xs text-ink-400">Al generar se reemplazará el contenido actual del formulario.</span>}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="card space-y-4 p-6">
            <div>
              <label htmlFor="title" className="label">Título *</label>
              <input id="title" value={form.title} onChange={(e) => onTitle(e.target.value)} className="input text-lg font-semibold" placeholder="Título del artículo" />
            </div>
            <div>
              <label htmlFor="slug" className="label">URL (slug) *</label>
              <div className="flex items-center gap-2">
                <span className="hidden text-sm text-ink-400 sm:inline">/blog/</span>
                <input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))} onBlur={() => set("slug", slugify(form.slug))} className="input font-mono text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="excerpt" className="label">Resumen (tarjeta del blog) <span className="text-ink-400">{form.excerpt.length}/220</span></label>
              <textarea id="excerpt" rows={3} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} className="input" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="label !mb-0">Contenido (Markdown) <span className="text-ink-400">{words} palabras</span></label>
              <button type="button" onClick={() => setPreview((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-electric-700"><Eye className="h-4 w-4" aria-hidden="true" /> {preview ? "Editar" : "Vista previa"}</button>
            </div>
            {preview ? (
              <div className="mt-4 rounded-xl border border-ink-200 p-6"><Markdown content={form.content || "*Sin contenido*"} /></div>
            ) : (
              <textarea id="content" rows={28} value={form.content} onChange={(e) => set("content", e.target.value)} className="input mt-4 font-mono text-sm leading-6" placeholder="## Primer subtítulo&#10;&#10;Texto del artículo en Markdown..." />
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink-900">Preguntas frecuentes <span className="text-sm font-normal text-ink-400">(se publican con schema FAQPage)</span></h2>
              <button type="button" onClick={() => set("faq", [...form.faq, { q: "", a: "" }])} className="btn-secondary !px-3 !py-1.5 text-xs"><Plus className="h-3.5 w-3.5" aria-hidden="true" /> Añadir</button>
            </div>
            <div className="mt-4 space-y-4">
              {form.faq.length === 0 && <p className="text-sm text-ink-500">Sin preguntas. Añade 3 a 5 preguntas reales con respuestas completas.</p>}
              {form.faq.map((f, i) => (
                <div key={i} className="rounded-xl border border-ink-200 p-4">
                  <div className="flex gap-2">
                    <input value={f.q} onChange={(e) => set("faq", form.faq.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} className="input font-medium" placeholder="Pregunta" aria-label={`Pregunta ${i + 1}`} />
                    <button type="button" onClick={() => set("faq", form.faq.filter((_, j) => j !== i))} className="shrink-0 rounded-xl border border-ink-200 px-3 text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label="Quitar pregunta"><X className="h-4 w-4" /></button>
                  </div>
                  <textarea value={f.a} onChange={(e) => set("faq", form.faq.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} rows={3} className="input mt-2" placeholder="Respuesta completa (2-3 oraciones)" aria-label={`Respuesta ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">SEO</h2>
            <div>
              <label htmlFor="metaTitle" className="label">Título SEO <span className={form.metaTitle.length > 60 ? "text-red-500" : "text-ink-400"}>{form.metaTitle.length}/60</span></label>
              <input id="metaTitle" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className="input" placeholder="Si se deja vacío se usa el título" />
            </div>
            <div>
              <label htmlFor="metaDescription" className="label">Meta descripción <span className={form.metaDescription.length > 160 ? "text-red-500" : "text-ink-400"}>{form.metaDescription.length}/160</span></label>
              <textarea id="metaDescription" rows={3} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="keywords" className="label">Palabras clave (coma)</label>
              <input id="keywords" value={form.keywords} onChange={(e) => set("keywords", e.target.value)} className="input" />
            </div>
          </div>
          <div className="card space-y-4 p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Organización</h2>
            <div>
              <label htmlFor="category" className="label">Categoría</label>
              <input id="category" list="categorias" value={form.category} onChange={(e) => set("category", e.target.value)} className="input" />
              <datalist id="categorias">
                {["Diseño web", "SEO", "GEO e IA", "Marketing digital", "Negocios", "Tiendas online"].map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="tags" className="label">Etiquetas (coma)</label>
              <input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} className="input" />
            </div>
            <div>
              <label htmlFor="coverImage" className="label">Imagen de portada (URL, opcional)</label>
              <input id="coverImage" value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} className="input" placeholder="https://... (si se deja vacío se genera una portada)" />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={form.generatedByAi} onChange={(e) => set("generatedByAi", e.target.checked)} /> Contenido generado con IA (uso interno)</label>
          </div>
          {post && (
            <button type="button" onClick={remove} className="btn w-full border border-red-200 bg-white text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" aria-hidden="true" /> Eliminar artículo</button>
          )}
        </aside>
      </div>
    </div>
  );
}
