import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { getDb, type Db } from "./client";
import * as t from "./schema";
import { seedPosts, seedProjects } from "./seed";
import type { Lead, LeadInput, Post, PostInput, PostStatus, Project, ProjectInput, ProjectStatus, Stats } from "@/lib/types";
import { readingMinutes, excerptFromMarkdown } from "@/lib/utils";

export type ListPostsOpts = { status?: PostStatus; limit?: number; offset?: number; category?: string; tag?: string };
export type ListProjectsOpts = { status?: ProjectStatus; featured?: boolean; limit?: number };

export interface Repo {
  readonly kind: "postgres" | "json";
  listPosts(opts?: ListPostsOpts): Promise<Post[]>;
  countPosts(opts?: ListPostsOpts): Promise<number>;
  getPostBySlug(slug: string): Promise<Post | null>;
  getPostById(id: string): Promise<Post | null>;
  createPost(input: PostInput): Promise<Post>;
  updatePost(id: string, patch: Partial<PostInput>): Promise<Post | null>;
  deletePost(id: string): Promise<boolean>;

  listProjects(opts?: ListProjectsOpts): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  getProjectById(id: string): Promise<Project | null>;
  createProject(input: ProjectInput): Promise<Project>;
  updateProject(id: string, patch: Partial<ProjectInput>): Promise<Project | null>;
  deleteProject(id: string): Promise<boolean>;

  createLead(input: LeadInput): Promise<Lead>;
  listLeads(limit?: number): Promise<Lead[]>;
  deleteLead(id: string): Promise<boolean>;

  stats(): Promise<Stats>;
}

// ---------------------------------------------------------------------
// Normalización de entradas (compartida por ambas implementaciones)
// ---------------------------------------------------------------------
function nowIso() {
  return new Date().toISOString();
}

function normalizePost(input: PostInput, existing?: Post): Post {
  const content = input.content ?? existing?.content ?? "";
  const status = input.status ?? existing?.status ?? "draft";
  const prevPublished = existing?.publishedAt ?? null;
  let publishedAt = input.publishedAt === undefined ? prevPublished : input.publishedAt;
  if (status === "published" && !publishedAt) publishedAt = nowIso();
  return {
    id: existing?.id ?? randomUUID(),
    slug: input.slug ?? existing?.slug ?? "",
    title: input.title ?? existing?.title ?? "",
    excerpt: input.excerpt ?? existing?.excerpt ?? excerptFromMarkdown(content),
    content,
    coverImage: input.coverImage === undefined ? existing?.coverImage ?? null : input.coverImage,
    category: input.category ?? existing?.category ?? "General",
    tags: input.tags ?? existing?.tags ?? [],
    metaTitle: input.metaTitle === undefined ? existing?.metaTitle ?? null : input.metaTitle,
    metaDescription: input.metaDescription === undefined ? existing?.metaDescription ?? null : input.metaDescription,
    keywords: input.keywords ?? existing?.keywords ?? [],
    faq: input.faq ?? existing?.faq ?? [],
    status,
    readingMinutes: readingMinutes(content),
    generatedByAi: input.generatedByAi ?? existing?.generatedByAi ?? false,
    prompt: input.prompt === undefined ? existing?.prompt ?? null : input.prompt,
    publishedAt,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };
}

function normalizeProject(input: ProjectInput, existing?: Project): Project {
  return {
    id: existing?.id ?? randomUUID(),
    slug: input.slug ?? existing?.slug ?? "",
    name: input.name ?? existing?.name ?? "",
    url: input.url ?? existing?.url ?? "",
    description: input.description ?? existing?.description ?? "",
    services: input.services ?? existing?.services ?? [],
    imageUrl: input.imageUrl === undefined ? existing?.imageUrl ?? null : input.imageUrl,
    featured: input.featured ?? existing?.featured ?? false,
    launchedAt: input.launchedAt === undefined ? existing?.launchedAt ?? null : input.launchedAt,
    status: input.status ?? existing?.status ?? "published",
    sortOrder: input.sortOrder ?? existing?.sortOrder ?? 0,
    audit: input.audit === undefined ? existing?.audit ?? null : input.audit,
    auditScore: input.auditScore === undefined ? existing?.auditScore ?? null : input.auditScore,
    auditedAt: input.auditedAt === undefined ? existing?.auditedAt ?? null : input.auditedAt,
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };
}

function matchesPost(p: Post, opts: ListPostsOpts) {
  if (opts.status && p.status !== opts.status) return false;
  if (opts.category && p.category.toLowerCase() !== opts.category.toLowerCase()) return false;
  if (opts.tag && !p.tags.some((x) => x.toLowerCase() === opts.tag!.toLowerCase())) return false;
  return true;
}

function sortPosts(a: Post, b: Post) {
  const da = a.publishedAt ?? a.createdAt;
  const db = b.publishedAt ?? b.createdAt;
  return db.localeCompare(da);
}

// ---------------------------------------------------------------------
// Implementación JSON (sin DATABASE_URL). Los datos viven en data/store.json.
// ---------------------------------------------------------------------
type Store = { posts: Post[]; projects: Project[]; leads: Lead[] };

class JsonRepo implements Repo {
  readonly kind = "json" as const;
  private file: string;
  private store: Store;

  constructor() {
    this.file = path.join(process.cwd(), "data", "store.json");
    this.store = this.load();
    if (this.store.projects.length === 0 && this.store.posts.length === 0) {
      this.store.projects = seedProjects.map((p) => normalizeProject(p));
      this.store.posts = seedPosts.map((p) => normalizePost(p));
      this.save();
    }
  }

  private load(): Store {
    try {
      const raw = fs.readFileSync(this.file, "utf8");
      const parsed = JSON.parse(raw) as Partial<Store>;
      return { posts: parsed.posts ?? [], projects: parsed.projects ?? [], leads: parsed.leads ?? [] };
    } catch {
      return { posts: [], projects: [], leads: [] };
    }
  }

  private save() {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.store, null, 2));
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.error("[store] no se pudo guardar data/store.json:", (err as Error).message);
    }
  }

  async listPosts(opts: ListPostsOpts = {}) {
    const all = this.store.posts.filter((p) => matchesPost(p, opts)).sort(sortPosts);
    const offset = opts.offset ?? 0;
    return all.slice(offset, opts.limit ? offset + opts.limit : undefined);
  }
  async countPosts(opts: ListPostsOpts = {}) {
    return this.store.posts.filter((p) => matchesPost(p, opts)).length;
  }
  async getPostBySlug(slug: string) {
    return this.store.posts.find((p) => p.slug === slug) ?? null;
  }
  async getPostById(id: string) {
    return this.store.posts.find((p) => p.id === id) ?? null;
  }
  async createPost(input: PostInput) {
    if (this.store.posts.some((p) => p.slug === input.slug)) throw new Error("SLUG_TAKEN");
    const post = normalizePost(input);
    this.store.posts.push(post);
    this.save();
    return post;
  }
  async updatePost(id: string, patch: Partial<PostInput>) {
    const idx = this.store.posts.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    if (patch.slug && this.store.posts.some((p) => p.slug === patch.slug && p.id !== id)) throw new Error("SLUG_TAKEN");
    const updated = normalizePost(patch as PostInput, this.store.posts[idx]);
    this.store.posts[idx] = updated;
    this.save();
    return updated;
  }
  async deletePost(id: string) {
    const before = this.store.posts.length;
    this.store.posts = this.store.posts.filter((p) => p.id !== id);
    this.save();
    return this.store.posts.length < before;
  }

  async listProjects(opts: ListProjectsOpts = {}) {
    let list = this.store.projects.filter((p) => (opts.status ? p.status === opts.status : true));
    if (opts.featured !== undefined) list = list.filter((p) => p.featured === opts.featured);
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
    return opts.limit ? list.slice(0, opts.limit) : list;
  }
  async getProjectBySlug(slug: string) {
    return this.store.projects.find((p) => p.slug === slug) ?? null;
  }
  async getProjectById(id: string) {
    return this.store.projects.find((p) => p.id === id) ?? null;
  }
  async createProject(input: ProjectInput) {
    if (this.store.projects.some((p) => p.slug === input.slug)) throw new Error("SLUG_TAKEN");
    const project = normalizeProject(input);
    this.store.projects.push(project);
    this.save();
    return project;
  }
  async updateProject(id: string, patch: Partial<ProjectInput>) {
    const idx = this.store.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    if (patch.slug && this.store.projects.some((p) => p.slug === patch.slug && p.id !== id)) throw new Error("SLUG_TAKEN");
    const updated = normalizeProject(patch as ProjectInput, this.store.projects[idx]);
    this.store.projects[idx] = updated;
    this.save();
    return updated;
  }
  async deleteProject(id: string) {
    const before = this.store.projects.length;
    this.store.projects = this.store.projects.filter((p) => p.id !== id);
    this.save();
    return this.store.projects.length < before;
  }

  async createLead(input: LeadInput) {
    const lead: Lead = { ...input, id: randomUUID(), createdAt: nowIso() };
    this.store.leads.unshift(lead);
    this.save();
    return lead;
  }
  async listLeads(limit = 200) {
    return [...this.store.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }
  async deleteLead(id: string) {
    const before = this.store.leads.length;
    this.store.leads = this.store.leads.filter((l) => l.id !== id);
    this.save();
    return this.store.leads.length < before;
  }

  async stats(): Promise<Stats> {
    return {
      posts: this.store.posts.length,
      publishedPosts: this.store.posts.filter((p) => p.status === "published").length,
      projects: this.store.projects.length,
      leads: this.store.leads.length,
    };
  }
}

// ---------------------------------------------------------------------
// Implementación Postgres (Drizzle)
// ---------------------------------------------------------------------
type PostRow = typeof t.posts.$inferSelect;
type ProjectRow = typeof t.projects.$inferSelect;
type LeadRow = typeof t.leads.$inferSelect;

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : null);
const date = (s: string | null | undefined) => (s ? new Date(s) : null);

function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    coverImage: r.coverImage,
    category: r.category,
    tags: r.tags ?? [],
    metaTitle: r.metaTitle,
    metaDescription: r.metaDescription,
    keywords: r.keywords ?? [],
    faq: r.faq ?? [],
    status: r.status as PostStatus,
    readingMinutes: r.readingMinutes,
    generatedByAi: r.generatedByAi,
    prompt: r.prompt,
    publishedAt: iso(r.publishedAt),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function postToRow(p: Post): typeof t.posts.$inferInsert {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    category: p.category,
    tags: p.tags,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    keywords: p.keywords,
    faq: p.faq,
    status: p.status,
    readingMinutes: p.readingMinutes,
    generatedByAi: p.generatedByAi,
    prompt: p.prompt,
    publishedAt: date(p.publishedAt),
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

function rowToProject(r: ProjectRow): Project {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    url: r.url,
    description: r.description,
    services: r.services ?? [],
    imageUrl: r.imageUrl,
    featured: r.featured,
    launchedAt: iso(r.launchedAt),
    status: r.status as ProjectStatus,
    sortOrder: r.sortOrder,
    audit: r.audit ?? null,
    auditScore: r.auditScore,
    auditedAt: iso(r.auditedAt),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function projectToRow(p: Project): typeof t.projects.$inferInsert {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    url: p.url,
    description: p.description,
    services: p.services,
    imageUrl: p.imageUrl,
    featured: p.featured,
    launchedAt: date(p.launchedAt),
    status: p.status,
    sortOrder: p.sortOrder,
    audit: p.audit,
    auditScore: p.auditScore,
    auditedAt: date(p.auditedAt),
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

function rowToLead(r: LeadRow): Lead {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    company: r.company,
    website: r.website,
    service: r.service,
    budget: r.budget,
    message: r.message,
    source: r.source,
    createdAt: r.createdAt.toISOString(),
  };
}

class PgRepo implements Repo {
  readonly kind = "postgres" as const;
  private seeded: Promise<void>;

  constructor(private db: Db, ready: Promise<void>) {
    this.seeded = ready.then(() => this.seedIfEmpty());
  }

  private async seedIfEmpty() {
    const [{ count }] = await this.db.select({ count: sql<number>`count(*)::int` }).from(t.projects);
    if (Number(count) === 0) {
      await this.db.insert(t.projects).values(seedProjects.map((p) => projectToRow(normalizeProject(p))));
    }
    const [{ count: pc }] = await this.db.select({ count: sql<number>`count(*)::int` }).from(t.posts);
    if (Number(pc) === 0) {
      await this.db.insert(t.posts).values(seedPosts.map((p) => postToRow(normalizePost(p))));
    }
  }

  private postWhere(opts: ListPostsOpts) {
    const conds = [];
    if (opts.status) conds.push(eq(t.posts.status, opts.status));
    if (opts.category) conds.push(sql`lower(${t.posts.category}) = ${opts.category.toLowerCase()}`);
    if (opts.tag) conds.push(sql`exists (select 1 from jsonb_array_elements_text(${t.posts.tags}) x where lower(x) = ${opts.tag.toLowerCase()})`);
    return conds.length ? and(...conds) : undefined;
  }

  async listPosts(opts: ListPostsOpts = {}) {
    await this.seeded;
    const q = this.db
      .select()
      .from(t.posts)
      .where(this.postWhere(opts))
      .orderBy(desc(sql`coalesce(${t.posts.publishedAt}, ${t.posts.createdAt})`))
      .offset(opts.offset ?? 0);
    const rows = await (opts.limit ? q.limit(opts.limit) : q);
    return rows.map(rowToPost);
  }
  async countPosts(opts: ListPostsOpts = {}) {
    await this.seeded;
    const [{ count }] = await this.db.select({ count: sql<number>`count(*)::int` }).from(t.posts).where(this.postWhere(opts));
    return Number(count);
  }
  async getPostBySlug(slug: string) {
    await this.seeded;
    const rows = await this.db.select().from(t.posts).where(eq(t.posts.slug, slug)).limit(1);
    return rows[0] ? rowToPost(rows[0]) : null;
  }
  async getPostById(id: string) {
    await this.seeded;
    const rows = await this.db.select().from(t.posts).where(eq(t.posts.id, id)).limit(1);
    return rows[0] ? rowToPost(rows[0]) : null;
  }
  async createPost(input: PostInput) {
    await this.seeded;
    if (await this.getPostBySlug(input.slug)) throw new Error("SLUG_TAKEN");
    const post = normalizePost(input);
    await this.db.insert(t.posts).values(postToRow(post));
    return post;
  }
  async updatePost(id: string, patch: Partial<PostInput>) {
    await this.seeded;
    const existing = await this.getPostById(id);
    if (!existing) return null;
    if (patch.slug && patch.slug !== existing.slug && (await this.getPostBySlug(patch.slug))) throw new Error("SLUG_TAKEN");
    const updated = normalizePost(patch as PostInput, existing);
    const { id: _id, ...rest } = postToRow(updated);
    await this.db.update(t.posts).set(rest).where(eq(t.posts.id, id));
    return updated;
  }
  async deletePost(id: string) {
    await this.seeded;
    const res = await this.db.delete(t.posts).where(eq(t.posts.id, id)).returning({ id: t.posts.id });
    return res.length > 0;
  }

  async listProjects(opts: ListProjectsOpts = {}) {
    await this.seeded;
    const conds = [];
    if (opts.status) conds.push(eq(t.projects.status, opts.status));
    if (opts.featured !== undefined) conds.push(eq(t.projects.featured, opts.featured));
    const q = this.db
      .select()
      .from(t.projects)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(asc(t.projects.sortOrder), asc(t.projects.createdAt));
    const rows = await (opts.limit ? q.limit(opts.limit) : q);
    return rows.map(rowToProject);
  }
  async getProjectBySlug(slug: string) {
    await this.seeded;
    const rows = await this.db.select().from(t.projects).where(eq(t.projects.slug, slug)).limit(1);
    return rows[0] ? rowToProject(rows[0]) : null;
  }
  async getProjectById(id: string) {
    await this.seeded;
    const rows = await this.db.select().from(t.projects).where(eq(t.projects.id, id)).limit(1);
    return rows[0] ? rowToProject(rows[0]) : null;
  }
  async createProject(input: ProjectInput) {
    await this.seeded;
    if (await this.getProjectBySlug(input.slug)) throw new Error("SLUG_TAKEN");
    const project = normalizeProject(input);
    await this.db.insert(t.projects).values(projectToRow(project));
    return project;
  }
  async updateProject(id: string, patch: Partial<ProjectInput>) {
    await this.seeded;
    const existing = await this.getProjectById(id);
    if (!existing) return null;
    if (patch.slug && patch.slug !== existing.slug && (await this.getProjectBySlug(patch.slug))) throw new Error("SLUG_TAKEN");
    const updated = normalizeProject(patch as ProjectInput, existing);
    const { id: _id, ...rest } = projectToRow(updated);
    await this.db.update(t.projects).set(rest).where(eq(t.projects.id, id));
    return updated;
  }
  async deleteProject(id: string) {
    await this.seeded;
    const res = await this.db.delete(t.projects).where(eq(t.projects.id, id)).returning({ id: t.projects.id });
    return res.length > 0;
  }

  async createLead(input: LeadInput) {
    await this.seeded;
    const lead: Lead = { ...input, id: randomUUID(), createdAt: nowIso() };
    await this.db.insert(t.leads).values({ ...lead, createdAt: new Date(lead.createdAt) });
    return lead;
  }
  async listLeads(limit = 200) {
    await this.seeded;
    const rows = await this.db.select().from(t.leads).orderBy(desc(t.leads.createdAt)).limit(limit);
    return rows.map(rowToLead);
  }
  async deleteLead(id: string) {
    await this.seeded;
    const res = await this.db.delete(t.leads).where(eq(t.leads.id, id)).returning({ id: t.leads.id });
    return res.length > 0;
  }

  async stats(): Promise<Stats> {
    await this.seeded;
    const [[p], [pp], [pr], [l]] = await Promise.all([
      this.db.select({ c: sql<number>`count(*)::int` }).from(t.posts),
      this.db.select({ c: sql<number>`count(*)::int` }).from(t.posts).where(eq(t.posts.status, "published")),
      this.db.select({ c: sql<number>`count(*)::int` }).from(t.projects),
      this.db.select({ c: sql<number>`count(*)::int` }).from(t.leads),
    ]);
    return { posts: Number(p.c), publishedPosts: Number(pp.c), projects: Number(pr.c), leads: Number(l.c) };
  }
}

// ---------------------------------------------------------------------
// Selector: Postgres si hay DATABASE_URL; si no, JSON (con aviso).
// ---------------------------------------------------------------------
const g = globalThis as unknown as { __twdRepo?: Repo; __twdWarned?: boolean };

export function getRepo(): Repo {
  if (g.__twdRepo) return g.__twdRepo;
  const conn = getDb();
  if (conn) {
    g.__twdRepo = new PgRepo(conn.db, conn.ready);
  } else {
    if (!g.__twdWarned) {
      g.__twdWarned = true;
      console.warn(
        "[store] Sin DATABASE_URL: los datos se guardan en data/store.json y se PERDERÁN en cada despliegue. " +
          "Configura una base de datos Postgres (Neon, Railway) para producción.",
      );
    }
    g.__twdRepo = new JsonRepo();
  }
  return g.__twdRepo;
}
