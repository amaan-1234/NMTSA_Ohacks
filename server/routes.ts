import type { Express } from "express";

export function registerRoutes(app: Express) {
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "NeuroLearnHub", timestamp: new Date().toISOString() });
  });
}
