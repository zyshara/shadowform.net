// server/api/engineering.js

import { strapiGet } from "../lib/strapi.js";
import {
  normalizeEngineeringPage,
  normalizeEngineeringArchive,
  normalizeWebArchiveProject,
} from "../models/engineering.js";
import { logger } from "../lib/logger.js";

const PROJ = "populate[projects][populate]";

// ── Populate helpers ──────────────────────────────────────────────────────────

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

// archive_v2 is a dynamic zone — each entry is a shadowform.engineering-web-archive-project
// component containing a "card" sub-component used for the archive list view.
const EWAP = "shadowform.engineering-web-archive-project";
const AV2  = "populate[archive_v2]";

function archiveV2Populate() {
  const on = `${AV2}[on][${EWAP}][populate][card][populate]`;
  return {
    [`${on}[header]`]:              "*",
    [`${on}[thumbnail][fields][0]`]: "url",
    [`${on}[thumbnail][fields][1]`]: "name",
    [`${on}[badge][fields][0]`]:    "url",
    [`${on}[badge][fields][1]`]:    "name",
    [`${on}[top_tags]`]:            "*",
    [`${on}[bottom_tags]`]:         "*",
  };
}

// ── Strapi fetches ────────────────────────────────────────────────────────────

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
    ...archiveV2Populate(),
  }, opts);
}

// Fetch a single Engineering Web Archive Project entry by slug directly
// from the collection type — this is the canonical source for the detail page.
async function getWebArchiveProjectBySlug(slug, opts = {}) {
  return strapiGet("/api/engineering-web-archive-projects", {
    "filters[slug][$eq]": slug,
    "populate":           "*",
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

  app.get("/api/engineering/archive/:slug", async (req, res) => {
    const { slug } = req.params;
    try {
      const data    = await getWebArchiveProjectBySlug(slug);
      const entry   = data?.data?.[0] ?? null;
      const project = normalizeWebArchiveProject(entry);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ data: project });
    } catch (err) {
      logger.error(`[engineering/archive/${slug}] fetch failed:`, err.message, err.body ?? "");
      res.status(502).json({ error: err.message });
    }
  });
}
