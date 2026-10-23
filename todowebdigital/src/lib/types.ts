// Tipos compartidos entre la capa de datos (Postgres o JSON), las rutas API y la UI.

export type PostStatus = "draft" | "published";
export type ProjectStatus = "published" | "hidden";

export type FaqItem = { q: string; a: string };

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  coverImage: string | null;
  category: string;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  faq: FaqItem[];
  status: PostStatus;
  readingMinutes: number;
  generatedByAi: boolean;
  prompt: string | null;
  publishedAt: string | null; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type PostInput = {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string | null;
  category?: string;
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  faq?: FaqItem[];
  status?: PostStatus;
  generatedByAi?: boolean;
  prompt?: string | null;
  publishedAt?: string | null;
};

export type CheckStatus = "pass" | "warn" | "fail" | "info";
export type CheckCategory = "seo" | "geo" | "performance";

export type AuditCheck = {
  id: string;
  category: CheckCategory;
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
};

export type AuditResult = {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  httpStatus: number;
  responseMs: number;
  htmlBytes: number;
  scores: { overall: number; seo: number; geo: number; performance: number };
  checks: AuditCheck[];
  meta: {
    title: string | null;
    description: string | null;
    h1: string[];
    canonical: string | null;
    lang: string | null;
    ogImage: string | null;
    jsonLdTypes: string[];
    wordCount: number;
    images: number;
    imagesWithoutAlt: number;
    internalLinks: number;
    externalLinks: number;
    scripts: number;
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    hasLlmsTxt: boolean;
    aiBotsBlocked: string[];
  };
  error?: string;
};

export type Project = {
  id: string;
  slug: string;
  name: string;
  url: string;
  description: string;
  services: string[];
  imageUrl: string | null;
  featured: boolean;
  launchedAt: string | null; // ISO date
  status: ProjectStatus;
  sortOrder: number;
  audit: AuditResult | null;
  auditScore: number | null;
  auditedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  slug: string;
  name: string;
  url: string;
  description?: string;
  services?: string[];
  imageUrl?: string | null;
  featured?: boolean;
  launchedAt?: string | null;
  status?: ProjectStatus;
  sortOrder?: number;
  audit?: AuditResult | null;
  auditScore?: number | null;
  auditedAt?: string | null;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  service: string | null;
  budget: string | null;
  message: string;
  source: string | null;
  createdAt: string;
};

export type LeadInput = Omit<Lead, "id" | "createdAt">;

export type Stats = { posts: number; publishedPosts: number; projects: number; leads: number };
