import { defineConfig } from "drizzle-kit";

// Solo se usa para `npm run db:push` / `npm run db:studio`.
// El servidor crea las tablas por sí mismo al arrancar (ver src/lib/db/client.ts),
// así que este archivo es opcional para desplegar.
export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/todowebdigital",
  },
});
