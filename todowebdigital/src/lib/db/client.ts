import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

type Cached = { pool: pg.Pool; db: Db; ready: Promise<void> } | null;

// Se guarda en globalThis para sobrevivir a la recarga de módulos de Next en
// desarrollo sin abrir un pool nuevo en cada cambio de archivo.
const g = globalThis as unknown as { __twdDb?: Cached };

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): { db: Db; ready: Promise<void> } | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (g.__twdDb) return { db: g.__twdDb.db, ready: g.__twdDb.ready };

  const needsSsl = !/localhost|127\.0\.0\.1/.test(url) && !/sslmode=disable/.test(url);
  const pool = new pg.Pool({
    connectionString: url,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on("error", (err) => {
    console.error("[db] error en el pool de Postgres:", err.message);
  });
  const db = drizzle(pool, { schema });

  // Crea las tablas si no existen. Idempotente, así que correr en cada
  // arranque es seguro y evita tener que ejecutar migraciones a mano.
  const ready = pool
    .query(schema.ENSURE_SCHEMA_SQL)
    .then(() => {
      console.log("[db] Postgres listo: los datos se guardan de forma permanente");
    })
    .catch((err) => {
      console.error("[db] no se pudo preparar el esquema:", err.message);
      throw err;
    });

  g.__twdDb = { pool, db, ready };
  return { db, ready };
}
