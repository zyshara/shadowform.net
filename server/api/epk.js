// server/api/epk.js

import { strapiGet } from "../lib/strapi.js";
import { normalizeEpk } from "../models/epk.js";
import { logger } from "../lib/logger.js";
import { artistPopulate } from "../lib/populate.js";

const ARTIST_PREFIX = "populate[artist][populate]";

// ── Strapi fetch ──────────────────────────────────────────────────────────────
async function getEpkBySlug(slug, opts = {}) {
  return strapiGet("/api/epk-pages", {
    "filters[artist][slug][$eq]": slug,
    // artist relation
    "populate[artist][fields]":   "*",
    ...artistPopulate(ARTIST_PREFIX),
    // media fields: use explicit [fields] to avoid traversing upload plugin internals
    "populate[featured_tracks][populate][file][fields][0]":            "url",
    "populate[photos_and_media][populate][thumbnail][fields][0]":      "url",
    // press: all scalar (caption, source, url are plain text — no relations)
    "populate[press]": "*",
    // links: label is text, url is a relation
    "populate[links][populate][url]": "*",
  }, opts);
}

// ── Route ─────────────────────────────────────────────────────────────────────
export function registerEpkRoutes(app) {
  app.get("/api/epk/:slug", async (req, res) => {
    try {
      const data    = await getEpkBySlug(req.params.slug);
      const entries = data.data ?? [];
      if (!entries.length) return res.status(404).json({ error: "EPK not found" });
      res.json({ data: normalizeEpk(entries[0]) });
    } catch (err) {
      logger.error("[epk] Strapi fetch failed:", err.message, err.body ?? "");
      res.status(502).json({ error: err.message });
    }
  });
}
