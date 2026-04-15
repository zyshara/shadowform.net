// server/api/engineering.js

import { strapiGet } from "../lib/strapi.js";
import { normalizeEngineeringPage } from "../models/engineering.js";
import { logger } from "../lib/logger.js";

// ── Strapi fetch ──────────────────────────────────────────────────────────────
async function getEngineeringPage(opts = {}) {
  return strapiGet("/api/engineering-page", {
    "populate[header]": "*",
  }, opts);
}

// ── Route ─────────────────────────────────────────────────────────────────────
export function registerEngineeringRoutes(app) {
  app.get("/api/engineering", async (req, res) => {
    try {
      const data = await getEngineeringPage();
      res.json({ data: normalizeEngineeringPage(data.data) });
    } catch (err) {
      logger.error("[engineering] fetch failed:", err.message, err.body ?? "");
      res.status(502).json({ error: err.message });
    }
  });
}
