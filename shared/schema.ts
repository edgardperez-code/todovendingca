import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
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
