// server/lib/epk.js
//
// Shared Strapi fetch for one artist's EPK page by slug. Used by both
// redspear and low-poly's own registerApi.js — they're the two apps with
// an EPK page, each registering their own /api/epk route (no slug param —
// the subdomain already identifies the artist) scoped to their own
// hostnames, both calling into this one fetch.

import { strapiGet } from "./strapi.js";
import { artistPopulate } from "./populate.js";

const ARTIST_PREFIX = "populate[artist][populate]";

export async function getEpkBySlug(slug, opts = {}) {
  return strapiGet("/api/epk-pages", {
    "filters[artist][slug][$eq]": slug,
    // artist relation
    "populate[artist][fields]":   "*",
    ...artistPopulate(ARTIST_PREFIX),
    // media fields: use explicit [fields] to avoid traversing upload plugin internals
    "populate[featured_tracks][populate][file][fields][0]":            "url",
    "populate[photos_and_media][populate][thumbnail][fields][0]":      "url",
    "populate[portrait][fields][0]":                                   "url",
    // press: all scalar (caption, source, url are plain text — no relations)
    "populate[press]": "*",
    // links: label is text, url is a relation
    "populate[links][populate][url]": "*",
  }, opts);
}
