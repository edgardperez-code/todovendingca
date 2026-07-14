import { type User, type InsertUser, type ContactMessage, type InsertContactMessage, type EncuestaVasos, type InsertEncuestaVasos } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  createEncuestaVasos(data: InsertEncuestaVasos): Promise<EncuestaVasos>;
  getEncuestasVasos(): Promise<EncuestaVasos[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contactMessages: Map<string, ContactMessage>;
  private encuestasVasos: Map<string, EncuestaVasos>;

  constructor() {
    this.users = new Map();
    this.contactMessages = new Map();
    this.encuestasVasos = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      phone: insertMessage.phone || null,
      company: insertMessage.company || null,
      createdAt: new Date(),
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async createEncuestaVasos(data: InsertEncuestaVasos): Promise<EncuestaVasos> {
    const id = randomUUID();
    const encuesta: EncuestaVasos = {
      id,
      bebida: data.bebida,
      calificacion: String(data.calificacion),
      comentario: data.comentario || null,
      fecha: new Date(),
    };
    this.encuestasVasos.set(id, encuesta);
    return encuesta;
  }

  async getEncuestasVasos(): Promise<EncuestaVasos[]> {
    return Array.from(this.encuestasVasos.values()).sort(
      (a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0)
    );
  }
}

export const storage = new MemStorage();
