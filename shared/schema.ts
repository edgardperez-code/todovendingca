import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  jsonb,
  boolean,
  doublePrecision,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Contact form messages
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Services offered
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

// Location where machines are installed
export interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  image?: string;
}

// FAQ item
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

// Value proposition item
export interface ValueProp {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Encuesta de vasos (Café Oriente feedback)
export const encuestaVasos = pgTable("encuesta_vasos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bebida: text("bebida").notNull(),
  calificacion: text("calificacion").notNull(),
  comentario: text("comentario"),
  fecha: timestamp("fecha").defaultNow(),
});

export const insertEncuestaVasosSchema = createInsertSchema(encuestaVasos).omit({
  id: true,
  fecha: true,
}).extend({
  bebida: z.enum([
    "Capuchino",
    "Mocachino",
    "Caf\u00e9 con Leche",
    "Latte Vainilla",
    "Capuchino Vainilla",
    "Chocolate Caliente",
    "Chocolate con Leche",
    "Caf\u00e9 Marr\u00f3n",
    "Caf\u00e9 Largo Negro",
    "T\u00e9 con Lim\u00f3n",
  ]),
  calificacion: z.coerce.number().int().min(1).max(5),
});

export type InsertEncuestaVasos = z.infer<typeof insertEncuestaVasosSchema>;
export type EncuestaVasos = typeof encuestaVasos.$inferSelect;

// === TIENDA: pedidos pagados con SPIDI y Gift Cards emitidas ===

// Copia congelada de cada linea del carrito al momento de crear el pedido.
export interface PedidoItem {
  productoId: string;
  nombre: string;
  cantidad: number;
  precioUsd: number;
  // Si al comprar era Gift Card. Se congela aqui para que un cambio posterior
  // del catalogo (renombrar o quitar el producto) no deje un pedido pagado sin
  // sus codigos. Los pedidos creados antes de este campo no lo traen: quien lo
  // lee debe tolerar undefined y caer al catalogo.
  esGiftCard: boolean;
  // Valor de cada Gift Card de la linea (lo que vale el codigo), en USD. Casi
  // siempre igual a precioUsd; difiere cuando en modo prueba se cobra un precio
  // de prueba (TIENDA_PRECIO_PRUEBA_USD). Los pedidos viejos no lo traen: quien
  // lo lee cae a precioUsd.
  valorUsd?: number;
}

export const pedidos = pgTable("pedidos", {
  // id aleatorio: va en la URL de resultado junto con claveAcceso.
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Numero legible para el cliente y para SPIDI (identifier de la sesion).
  numero: text("numero").notNull().unique(),
  claveAcceso: text("clave_acceso").notNull(),
  // Evita crear dos pedidos si el navegador reenvia el mismo checkout.
  claveIdempotencia: text("clave_idempotencia").unique(),
  // pendiente | pagado | fallido | expirado | error
  estado: text("estado").notNull().default("pendiente"),
  items: jsonb("items").$type<PedidoItem[]>().notNull(),
  // Total calculado por el servidor, en centavos de USD (autoritativo).
  totalUsdCentavos: integer("total_usd_centavos").notNull(),
  compradorNombre: text("comprador_nombre").notNull(),
  compradorEmail: text("comprador_email").notNull(),
  compradorTelefono: text("comprador_telefono"),
  // Sesion de pago de SPIDI. No hay forma de listar sesiones en SPIDI: este id
  // es la unica llave para consultarla despues.
  spidiSessionId: text("spidi_session_id").unique(),
  spidiPaymentUrl: text("spidi_payment_url"),
  motivo: text("motivo"),
  // Fase 1 (pago). Datos informativos tal como los reporta SPIDI.
  pagoMetodo: text("pago_metodo"),
  pagoBanco: text("pago_banco"),
  pagoReferencia: text("pago_referencia"),
  pagoMontoVes: doublePrecision("pago_monto_ves"),
  pagoTasaBcv: doublePrecision("pago_tasa_bcv"),
  spidiTransaccionId: integer("spidi_transaccion_id"),
  spidiComprobanteUrl: text("spidi_comprobante_url"),
  pagadoEn: timestamp("pagado_en"),
  // Fase 2 (acreditacion a la cuenta del comercio). No cambia `estado`.
  acreditadoEn: timestamp("acreditado_en"),
  acreditadoMontoVes: doublePrecision("acreditado_monto_ves"),
  acreditadoComisionVes: doublePrecision("acreditado_comision_ves"),
  // Solo la parte izquierda de bank_reference_id: la que casa con el banco.
  acreditadoReferencia: text("acreditado_referencia"),
  acreditacionFallida: boolean("acreditacion_fallida").notNull().default(false),
  // Correos de la compra. Se guarda cuando salio cada uno para reintentar solo
  // el que falto, y cuantas veces se intento para no reintentar sin fin (el
  // dominio de prueba de Resend rechaza siempre a los compradores).
  correoCompradorEnviadoEn: timestamp("correo_comprador_enviado_en"),
  avisoVentaEnviadoEn: timestamp("aviso_venta_enviado_en"),
  correoIntentos: integer("correo_intentos").notNull().default(0),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
});

export type Pedido = typeof pedidos.$inferSelect;

export const giftCards = pgTable("gift_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codigo: text("codigo").notNull().unique(),
  pedidoId: varchar("pedido_id")
    .notNull()
    .references(() => pedidos.id),
  montoUsdCentavos: integer("monto_usd_centavos").notNull(),
  // activa | canjeada | anulada | prueba (EstadoGiftCard en shared/tienda.ts).
  // "prueba": emitida para un pedido de prueba (TVP-, pago no real); nunca
  // se canjea. Es texto libre, asi que agregar ese estado no cambia la tabla.
  estado: text("estado").notNull().default("activa"),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  canjeadoEn: timestamp("canjeado_en"),
});

export type GiftCard = typeof giftCards.$inferSelect;

// Avisos (webhooks) de SPIDI ya procesados, por su idempotency-key.
export const spidiEventos = pgTable("spidi_eventos", {
  idempotencyKey: text("idempotency_key").primaryKey(),
  evento: text("evento").notNull(),
  sessionId: text("session_id"),
  recibidoEn: timestamp("recibido_en").notNull().defaultNow(),
});

// Inventario de codigos de Gift Card. Los carga el dueno desde /admin (son los
// codigos que aceptan sus maquinas: la tienda no los inventa) y se entregan uno
// por unidad vendida.
// estado: disponible | reservado | entregado | anulado (EstadoCodigoInventario
// en shared/admin.ts). Un checkout reserva (pedidoId + reservadoEn) en la misma
// transaccion en que crea el pedido; al pagarse pasa a entregado y se copia a
// gift_cards. Si el pago falla o expira, vuelve a disponible.
// OJO: server/storage.ts crea esta tabla (y pedidos, gift_cards y
// spidi_eventos) con CREATE TABLE IF NOT EXISTS si aun
// no existe (para no depender de un db:push en el despliegue). Si se cambia
// algo aqui, hay que cambiar tambien ese SQL.
export const codigosInventario = pgTable(
  "codigos_inventario",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    productoId: text("producto_id").notNull(),
    codigo: text("codigo").notNull().unique(),
    estado: text("estado").notNull().default("disponible"),
    pedidoId: varchar("pedido_id").references(() => pedidos.id),
    creadoEn: timestamp("creado_en").notNull().defaultNow(),
    reservadoEn: timestamp("reservado_en"),
    entregadoEn: timestamp("entregado_en"),
  },
  (t) => [
    // Para contar el stock y tomar el siguiente disponible de cada producto.
    index("codigos_inventario_producto_estado_idx").on(t.productoId, t.estado),
    // Para encontrar las reservas de un pedido al pagarlo o liberarlo.
    index("codigos_inventario_pedido_idx").on(t.pedidoId),
  ],
);

export type CodigoInventario = typeof codigosInventario.$inferSelect;
