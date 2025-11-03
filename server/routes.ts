import type { Express } from "express";
import { db } from "./db";
import { newsletterSubscriptions } from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import { EmailService } from "./email-service";

export function registerRoutes(app: Express) {
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "NeuroLearnHub", timestamp: new Date().toISOString() });
  });

  // Newsletter subscription endpoint
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ 
          success: false, 
          message: "Please provide a valid email address" 
        });
      }

      // Check if email already exists
      const existingSubscription = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.email, email))
        .limit(1);

      if (existingSubscription.length > 0) {
        return res.status(200).json({ 
          success: true, 
          message: "Email already subscribed to newsletter" 
        });
      }

      // Add new subscription
      await db.insert(newsletterSubscriptions).values({
        email,
        subscribedAt: new Date(),
        isActive: true
      });

      res.status(200).json({ 
        success: true, 
        message: "Successfully subscribed to newsletter!" 
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to subscribe to newsletter" 
      });
    }
  });

  // Get all newsletter subscribers (admin only)
  app.get("/api/newsletter/subscribers", async (req, res) => {
    try {
      const subscribers = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.isActive, true))
        .orderBy(desc(newsletterSubscriptions.subscribedAt));

      res.status(200).json({ 
        success: true, 
        subscribers: subscribers.map(sub => ({
          email: sub.email,
          subscribedAt: sub.subscribedAt
        }))
      });
    } catch (error) {
      console.error("Get subscribers error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch subscribers" 
      });
    }
  });

  // Send newsletter to all subscribers (admin only)
  app.post("/api/newsletter/send", async (req, res) => {
    try {
      const { subject, content } = req.body;
      
      if (!subject || !content) {
        return res.status(400).json({ 
          success: false, 
          message: "Subject and content are required" 
        });
      }

      // Get all active subscribers
      const subscribers = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.isActive, true));

      if (subscribers.length === 0) {
        return res.status(200).json({ 
          success: true, 
          message: "No active subscribers found" 
        });
      }

      // Generate HTML content
      const htmlContent = EmailService.generateNewsletterHTML(subject, content);

      // Send newsletter
      const result = await EmailService.sendNewsletter({
        to: subscribers.map(sub => sub.email),
        subject,
        htmlContent,
        textContent: content
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Send newsletter error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to send newsletter" 
      });
    }
  });
}
