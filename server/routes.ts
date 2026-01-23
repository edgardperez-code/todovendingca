import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";
import { sendContactNotification } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      
      // Send email notification to todovendingca@gmail.com
      const emailSent = await sendContactNotification({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
        company: validatedData.company || undefined,
        message: validatedData.message
      });
      
      if (!emailSent) {
        console.warn("Email notification failed but message was saved");
      }
      
      res.status(201).json({ success: true, message });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Datos invalidos", 
          details: error.errors 
        });
      } else {
        console.error("Error creating contact message:", error);
        res.status(500).json({ 
          success: false, 
          error: "Error interno del servidor" 
        });
      }
    }
  });

  // Get all contact messages (for admin purposes)
  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ 
        success: false, 
        error: "Error interno del servidor" 
      });
    }
  });

  return httpServer;
}
