// server/api/artists.js

import { strapiGet } from "../lib/strapi.js";
import { normalizeArtist } from "../models/artist.js";
import { logger } from "../lib/logger.js";

export function registerArtistRoutes(app) {
  app.get("/api/artists/:slug", async (req, res) => {
    try {
      const data = await getArtistBySlug(req.params.slug);
      const artists = (data.data ?? []).map(normalizeArtist);
      if (!artists.length) return res.status(404).json({ error: "Artist not found" });
      res.json({ artist: artists[0] });
    } catch (err) {
      logger.error("[artists] Strapi fetch failed:", err.message, err.body ?? "");
      res.status(502).json({ error: err.message });
    }
  });

  app.get("/api/artists", async (req, res) => {
    try {
      const data = await getArtists();
      const artists = (data.data ?? []).map(normalizeArtist);
      res.json({ artists });
    } catch (err) {
      logger.error("[artists] Strapi fetch failed:", err.message, err.body ?? "");
      res.status(502).json({ error: err.message });
    }
  });
}

export async function getArtists(params = {}, opts = {}) {
  return strapiGet("/api/artists", {
    "populate[management_page_card_links][populate][label]": "*",
    "populate[management_page_card_links][populate][url]":   "*",
    "populate[icon][fields]": "*",
    "populate[artist_statistics][fields]": "*",
    "populate[primary_genre]": "*",
    "populate[genres]": "*",
    "populate[instagram]": "*",
    "populate[spotify]":   "*",
    "populate[songkick]":  "*",
    "pagination[pageSize]": "100",
    ...params,
  }, opts);
}

export async function getArtistBySlug(slug, opts = {}) {
  return getArtists({ "filters[slug][$eq]": slug }, opts);
}
