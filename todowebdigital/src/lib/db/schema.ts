import { pgTable, text, boolean, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import type { AuditResult, FaqItem } from "@/lib/types";

export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""),
    coverImage: text("cover_image"),
    category: text("category").notNull().default("General"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
    faq: jsonb("faq").$type<FaqItem[]>().notNull().default([]),
    status: text("status").notNull().default("draft"),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    generatedByAi: boolean("generated_by_ai").notNull().default(false),
    prompt: text("prompt"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("posts_status_published_idx").on(t.status, t.publishedAt)],
);

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull().default(""),
  services: jsonb("services").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url"),
  featured: boolean("featured").notNull().default(false),
  launchedAt: timestamp("launched_at", { withTimezone: true }),
  status: text("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  audit: jsonb("audit").$type<AuditResult | null>(),
  auditScore: integer("audit_score"),
  auditedAt: timestamp("audited_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  website: text("website"),
  service: text("service"),
  budget: text("budget"),
  message: text("message").notNull(),
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// SQL idempotente que el servidor ejecuta al arrancar, para que desplegar no
// exija correr migraciones a mano. Debe reflejar exactamente las tablas de arriba.
export const ENSURE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS posts (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image text,
  category text NOT NULL DEFAULT 'General',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_title text,
  meta_description text,
  keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  reading_minutes integer NOT NULL DEFAULT 1,
  generated_by_ai boolean NOT NULL DEFAULT false,
  prompt text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_status_published_idx ON posts (status, published_at);
CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  url text NOT NULL,
  description text NOT NULL DEFAULT '',
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  launched_at timestamptz,
  status text NOT NULL DEFAULT 'published',
  sort_order integer NOT NULL DEFAULT 0,
  audit jsonb,
  audit_score integer,
  audited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS leads (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  website text,
  service text,
  budget text,
  message text NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;
