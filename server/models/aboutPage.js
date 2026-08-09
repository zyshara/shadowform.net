// server/models/aboutPage.js

import { richTextToHtml } from "./header.js";

/**
 * Maps a raw Strapi "Dome of Doom About Page" single-type entry → the shape
 * the client expects. Compatible with both Strapi v4 (entry.attributes) and
 * v5 (flat entry).
 */
export function normalizeAboutPage(raw) {
  const a = raw?.attributes ?? raw;
  if (!a) return null;

  return {
    description: Array.isArray(a.Description) ? richTextToHtml(a.Description) : "",
  };
}
