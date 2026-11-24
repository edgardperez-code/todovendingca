// Donde viven los articulos del blog. Con DATABASE_URL: tabla "articulos" en
// Postgres (se crea sola al primer uso). Sin ella: en memoria, como el resto
// del sitio en local (se pierde al reiniciar).
//
// Va aparte de server/storage.ts a proposito: el blog no toca nada de la
// tienda ni de los pagos.
import { randomUUID } from "node:crypto";
import { pool } from "./db";
import { minutosDeLectura, type Articulo, type ArticuloEntrada } from "@shared/blog";

export class SlugRepetidoError extends Error {
  constructor() {
    super("Ya existe otro artículo con esa URL");
    this.name = "SlugRepetidoError";
  }
}

export interface BlogStorage {
  listar(opciones?: { soloPublicados?: boolean }): Promise<Articulo[]>;
  obtener(id: string): Promise<Articulo | undefined>;
  obtenerPorSlug(slug: string): Promise<Articulo | undefined>;
  crear(datos: ArticuloEntrada): Promise<Articulo>;
  actualizar(id: string, datos: ArticuloEntrada): Promise<Articulo | undefined>;
  borrar(id: string): Promise<boolean>;
}

// Fecha de publicacion: se pone la primera vez que pasa a "publicado" y se
// conserva despues (aunque vuelva a borrador y se publique otra vez).
function fechaPublicacion(anterior: Articulo | undefined, estado: ArticuloEntrada["estado"]): string | null {
  if (anterior?.publicadoEn) return anterior.publicadoEn;
  return estado === "publicado" ? new Date().toISOString() : null;
}

function ordenar(lista: Articulo[]): Articulo[] {
  return lista.sort((a, b) => (b.publicadoEn ?? b.creadoEn).localeCompare(a.publicadoEn ?? a.creadoEn));
}

class MemBlogStorage implements BlogStorage {
  private articulos = new Map<string, Articulo>();

  async listar(opciones?: { soloPublicados?: boolean }) {
    const todos = Array.from(this.articulos.values()).map((a) => ({ ...a }));
    return ordenar(opciones?.soloPublicados ? todos.filter((a) => a.estado === "publicado") : todos);
  }

  async obtener(id: string) {
    const a = this.articulos.get(id);
    return a ? { ...a } : undefined;
  }

  async obtenerPorSlug(slug: string) {
    const a = Array.from(this.articulos.values()).find((x) => x.slug === slug);
    return a ? { ...a } : undefined;
  }

  private revisarSlug(slug: string, id: string | null) {
    if (Array.from(this.articulos.values()).some((a) => a.slug === slug && a.id !== id)) throw new SlugRepetidoError();
  }

  async crear(datos: ArticuloEntrada) {
    this.revisarSlug(datos.slug, null);
    const ahora = new Date().toISOString();
    const articulo: Articulo = {
      ...datos,
      id: randomUUID(),
      minutosLectura: minutosDeLectura(datos.contenido),
      publicadoEn: fechaPublicacion(undefined, datos.estado),
      creadoEn: ahora,
      actualizadoEn: ahora,
    };
    this.articulos.set(articulo.id, articulo);
    return { ...articulo };
  }

  async actualizar(id: string, datos: ArticuloEntrada) {
    const anterior = this.articulos.get(id);
    if (!anterior) return undefined;
    this.revisarSlug(datos.slug, id);
    const articulo: Articulo = {
      ...anterior,
      ...datos,
      minutosLectura: minutosDeLectura(datos.contenido),
      publicadoEn: fechaPublicacion(anterior, datos.estado),
      actualizadoEn: new Date().toISOString(),
    };
    this.articulos.set(id, articulo);
    return { ...articulo };
  }

  async borrar(id: string) {
    return this.articulos.delete(id);
  }
}

// === Postgres ===

type Fila = Record<string, unknown>;

function iso(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  return valor instanceof Date ? valor.toISOString() : new Date(String(valor)).toISOString();
}

function deFila(f: Fila): Articulo {
  return {
    id: String(f.id),
    slug: String(f.slug),
    titulo: String(f.titulo),
    resumen: String(f.resumen ?? ""),
    contenido: String(f.contenido ?? ""),
    categoria: String(f.categoria ?? "Guías"),
    etiquetas: (f.etiquetas as string[]) ?? [],
    metaTitulo: (f.meta_titulo as string | null) ?? null,
    metaDescripcion: (f.meta_descripcion as string | null) ?? null,
    palabrasClave: (f.palabras_clave as string[]) ?? [],
    faq: (f.faq as Articulo["faq"]) ?? [],
    imagenPortada: (f.imagen_portada as string | null) ?? null,
    estado: f.estado === "publicado" ? "publicado" : "borrador",
    minutosLectura: Number(f.minutos_lectura ?? 1),
    generadoConIa: Boolean(f.generado_con_ia),
    prompt: (f.prompt as string | null) ?? null,
    publicadoEn: iso(f.publicado_en),
    creadoEn: iso(f.creado_en) ?? new Date().toISOString(),
    actualizadoEn: iso(f.actualizado_en) ?? new Date().toISOString(),
  };
}

const CREAR_TABLA = `
CREATE TABLE IF NOT EXISTS articulos (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  resumen text NOT NULL DEFAULT '',
  contenido text NOT NULL DEFAULT '',
  categoria text NOT NULL DEFAULT 'Guías',
  etiquetas jsonb NOT NULL DEFAULT '[]'::jsonb,
  meta_titulo text,
  meta_descripcion text,
  palabras_clave jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  imagen_portada text,
  estado text NOT NULL DEFAULT 'borrador',
  minutos_lectura integer NOT NULL DEFAULT 1,
  generado_con_ia boolean NOT NULL DEFAULT false,
  prompt text,
  publicado_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS articulos_estado_publicado_idx ON articulos (estado, publicado_en DESC);`;

function esSlugRepetido(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

class PgBlogStorage implements BlogStorage {
  private lista: Promise<void> | null = null;

  constructor(private readonly db: NonNullable<typeof pool>) {}

  private preparar(): Promise<void> {
    if (!this.lista) {
      this.lista = this.db
        .query(CREAR_TABLA)
        .then(() => undefined)
        .catch((error) => {
          this.lista = null;
          throw error;
        });
    }
    return this.lista;
  }

  private async consulta(sql: string, valores: unknown[] = []): Promise<Fila[]> {
    await this.preparar();
    return (await this.db.query(sql, valores)).rows as Fila[];
  }

  async listar(opciones?: { soloPublicados?: boolean }) {
    const filas = await this.consulta(
      `SELECT * FROM articulos ${opciones?.soloPublicados ? "WHERE estado = 'publicado'" : ""}
       ORDER BY COALESCE(publicado_en, creado_en) DESC`,
    );
    return filas.map(deFila);
  }

  async obtener(id: string) {
    const [f] = await this.consulta("SELECT * FROM articulos WHERE id = $1", [id]);
    return f ? deFila(f) : undefined;
  }

  async obtenerPorSlug(slug: string) {
    const [f] = await this.consulta("SELECT * FROM articulos WHERE slug = $1", [slug]);
    return f ? deFila(f) : undefined;
  }

  private valores(d: ArticuloEntrada) {
    return [
      d.slug,
      d.titulo,
      d.resumen,
      d.contenido,
      d.categoria,
      JSON.stringify(d.etiquetas),
      d.metaTitulo,
      d.metaDescripcion,
      JSON.stringify(d.palabrasClave),
      JSON.stringify(d.faq),
      d.imagenPortada,
      d.estado,
      minutosDeLectura(d.contenido),
      d.generadoConIa,
      d.prompt,
    ];
  }

  async crear(d: ArticuloEntrada) {
    try {
      const [f] = await this.consulta(
        `INSERT INTO articulos (id, slug, titulo, resumen, contenido, categoria, etiquetas, meta_titulo, meta_descripcion,
           palabras_clave, faq, imagen_portada, estado, minutos_lectura, generado_con_ia, prompt, publicado_en)
         VALUES ($16, $1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9::jsonb, $10::jsonb, $11, $12, $13, $14, $15, $17)
         RETURNING *`,
        [...this.valores(d), randomUUID(), fechaPublicacion(undefined, d.estado)],
      );
      return deFila(f);
    } catch (error) {
      if (esSlugRepetido(error)) throw new SlugRepetidoError();
      throw error;
    }
  }

  async actualizar(id: string, d: ArticuloEntrada) {
    try {
      const [f] = await this.consulta(
        `UPDATE articulos SET slug = $1, titulo = $2, resumen = $3, contenido = $4, categoria = $5, etiquetas = $6::jsonb,
           meta_titulo = $7, meta_descripcion = $8, palabras_clave = $9::jsonb, faq = $10::jsonb, imagen_portada = $11,
           estado = $12, minutos_lectura = $13, generado_con_ia = $14, prompt = $15,
           publicado_en = COALESCE(publicado_en, CASE WHEN $12 = 'publicado' THEN now() END),
           actualizado_en = now()
         WHERE id = $16 RETURNING *`,
        [...this.valores(d), id],
      );
      return f ? deFila(f) : undefined;
    } catch (error) {
      if (esSlugRepetido(error)) throw new SlugRepetidoError();
      throw error;
    }
  }

  async borrar(id: string) {
    const filas = await this.consulta("DELETE FROM articulos WHERE id = $1 RETURNING id", [id]);
    return filas.length > 0;
  }
}

export const blogStorage: BlogStorage = pool ? new PgBlogStorage(pool) : new MemBlogStorage();
