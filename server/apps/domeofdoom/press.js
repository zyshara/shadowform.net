// server/apps/domeofdoom/press.js
import { strapiGet } from "#lib/strapi.js";
import { logger } from "#lib/logger.js";
import { cdnImg } from "#lib/cloudinary.js";

function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return null;
  const text = blocks
    .flatMap((block) => block.children ?? [])
    .filter((child) => child.type === "text")
    .map((child) => child.text)
    .join("")
    .trim();
  return text || null;
}

function normalizeOutlet(outlet) {
  if (!outlet) return null;
  return {
    name:    outlet.name ?? null,
    website: outlet.website ?? null,
    logo:    outlet.logo?.url ?? null,
  };
}

function normalizeItem(item) {
  return {
    id:        item.documentId,
    title:     item.title ?? null,
    date:      item.date ?? null,
    url:       item.url ?? null,
    excerpt:   blocksToText(item.summary),
    ogImage:   cdnImg(item.ogImage ?? null, 400),
    imageMode: item.imageMode ?? "og",
    thumbnail: cdnImg(item.thumbnail?.url ?? null, 400),
    outlet:    normalizeOutlet(item.outlet),
  };
}

async function getPressItems() {
  return strapiGet("/api/dome-of-doom-press-items", {
    "populate[outlet][populate]": "*",
    "populate[thumbnail]":        "true",
    "pagination[pageSize]": 200,
    "sort": "date:desc",
  });
}

async function getPressOutlets() {
  return strapiGet("/api/dome-of-doom-press-outlets", {
    "fields[0]": "name",
    "fields[1]": "website",
    "pagination[pageSize]": 100,
    "sort": "name:asc",
  });
}

export function registerPressRoutes(app) {
  app.get("/api/press", async (_req, res) => {
    try {
      const data  = await getPressItems();
      const items = (data.data ?? []).map(normalizeItem);
      res.json({ items });
    } catch (err) {
      logger.error("[press] Strapi fetch failed:", err.message, err.body ?? "");
      res.status(502).json({ error: "Failed to fetch press items." });
    }
  });

  app.get("/api/press/outlets", async (_req, res) => {
    try {
      const data    = await getPressOutlets();
      const outlets = (data.data ?? []).map((o) => ({ name: o.name, website: o.website }));
      res.json({ outlets });
    } catch (err) {
      logger.error("[press/outlets] Strapi fetch failed:", err.message);
      res.status(502).json({ error: "Failed to fetch outlets." });
    }
  });
}
