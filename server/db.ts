// Conexion a Postgres (Neon) con Drizzle.
//
// La conexion es OPCIONAL a proposito: si no hay DATABASE_URL, esto devuelve
// null y el almacenamiento cae a la version en memoria. Asi el sitio arranca
// igual aunque falte la variable, en vez de morir en el arranque.
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

export type BaseDatos = ReturnType<typeof drizzle<typeof schema>>;

let pool: pg.Pool | null = null;
let db: BaseDatos | null = null;

if (process.env.DATABASE_URL) {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon exige TLS. rejectUnauthorized:false evita tener que empaquetar el
    // certificado raiz; la conexion sigue cifrada.
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  // Un error del pool (por ejemplo, Neon durmiendo el endpoint) no debe tumbar
  // el proceso: se registra y el pool reconecta en la siguiente consulta.
  pool.on("error", (err) => {
    console.error("[db] error en el pool de Postgres:", err.message);
  });

  db = drizzle(pool, { schema });
  console.log("[db] Postgres configurado: los datos se guardan de forma permanente");
} else {
  console.warn(
    "[db] Sin DATABASE_URL: se usa almacenamiento en MEMORIA. " +
      "Los datos se perderan en cada reinicio o despliegue."
  );
}

export { db, pool };
