// server/api/management.js

import { strapiGet } from "../lib/strapi.js";
import { normalizeManagementPage } from "../models/management.js";
import { logger } from "../lib/logger.js";
import { artistPopulate } from "../lib/populate.js";

const ARTIST_PREFIX = "populate[artists][populate][artist][populate]";

// ── Strapi fetch ──────────────────────────────────────────────────────────────
async function getManagementPage(opts = {}) {
  return strapiGet("/api/management-page", {
    "populate[header]":                              "*",
    "populate[artists][populate][artist][fields]":   "*",
    ...artistPopulate(ARTIST_PREFIX),
    "populate[artists][populate][links][populate][url]": "*",
  }, opts);
}

// ── Route ─────────────────────────────────────────────────────────────────────
export function registerManagementRoutes(app) {
  app.get("/api/management", async (req, res) => {
    try {
      const data = await getManagementPage();
      res.json({ data: normalizeManagementPage(data.data) });
    } catch (err) {
      logger.error("[management] fetch failed:", err.message, err.body ?? "");
      res.status(502).json({ error: err.message });
    }
  });
}
