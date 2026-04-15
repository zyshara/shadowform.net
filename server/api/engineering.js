// server/api/engineering.js

import { strapiGet } from "../lib/strapi.js";
import { normalizeEngineeringPage } from "../models/engineering.js";
import { logger } from "../lib/logger.js";

const PROJ = "populate[projects][populate]";

// ── Strapi fetch ──────────────────────────────────────────────────────────────
async function getEngineeringPage(opts = {}) {
  return strapiGet("/api/engineering-page", {
    "populate[header]":                      "*",
    [`${PROJ}[header]`]:                     "*",
    [`${PROJ}[thumbnail][fields][0]`]:       "url",
    [`${PROJ}[thumbnail][fields][1]`]:       "name",
    [`${PROJ}[badge][fields][0]`]:           "url",
    [`${PROJ}[badge][fields][1]`]:           "name",
    [`${PROJ}[top_tags]`]:                   "*",
    [`${PROJ}[bottom_tags]`]:               "*",
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
