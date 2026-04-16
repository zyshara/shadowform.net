// server/api/engineering.js

import { strapiGet } from "../lib/strapi.js";
import { normalizeEngineeringPage, normalizeEngineeringArchive } from "../models/engineering.js";
import { logger } from "../lib/logger.js";

const PROJ = "populate[projects][populate]";
const ARCH = "populate[archive][populate]";

// ── Strapi fetches ────────────────────────────────────────────────────────────

function projectPopulate(prefix) {
  return {
    [`${prefix}[header]`]:              "*",
    [`${prefix}[thumbnail][fields][0]`]: "url",
    [`${prefix}[thumbnail][fields][1]`]: "name",
    [`${prefix}[badge][fields][0]`]:    "url",
    [`${prefix}[badge][fields][1]`]:    "name",
    [`${prefix}[top_tags]`]:            "*",
    [`${prefix}[bottom_tags]`]:         "*",
  };
}

async function getEngineeringPage(opts = {}) {
  return strapiGet("/api/engineering-page", {
    "populate[header]": "*",
    ...projectPopulate(PROJ),
  }, opts);
}

async function getEngineeringArchivePage(opts = {}) {
  return strapiGet("/api/engineering-page", {
    "populate[header]": "*",
    ...projectPopulate(PROJ),
    ...projectPopulate(ARCH),
  }, opts);
}

// ── Routes ────────────────────────────────────────────────────────────────────
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

  app.get("/api/engineering/archive", async (req, res) => {
    try {
      const data = await getEngineeringArchivePage();
      res.json({ data: normalizeEngineeringArchive(data.data) });
    } catch (err) {
      logger.error("[engineering/archive] fetch failed:", err.message, err.body ?? "");
      res.status(502).json({ error: err.message });
    }
  });
}
