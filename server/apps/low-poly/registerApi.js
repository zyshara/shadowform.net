// server/apps/low-poly/registerApi.js

import { getEpkBySlug } from "#lib/epk.js";
import { normalizeEpk } from "#models/epk.js";
import { logger } from "#lib/logger.js";
import { getApp } from "#lib/appsConfig.js";

const ARTIST_SLUG = getApp("low-poly").artistSlug;

export function registerLowPolyApi(app) {
  // No :slug param — the subdomain already tells us which artist this is,
  // low-poly always wants its own EPK (see config/apps.json's artistSlug).
  app.get("/api/epk", async (req, res) => {
    try {
      const data    = await getEpkBySlug(ARTIST_SLUG);
      const entries = data.data ?? [];
      if (!entries.length) return res.status(404).json({ error: "EPK not found" });
      res.json({ data: normalizeEpk(entries[0]) });
    } catch (err) {
      logger.error("[low-poly] EPK fetch failed:", err.message, err.body ?? "");
      res.status(502).json({ error: err.message });
    }
  });
}
