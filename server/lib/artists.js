// server/lib/artists.js
//
// Shared helpers for splitting Bandcamp's free-text `artist` field into
// individual artist names and resolving/creating their Dome of Doom Artist
// entries in Strapi. Used by both the discography sync cron job and the
// one-off backfill script so the split rules never drift between them.

import { strapiGet, strapiPost } from "./strapi.js";

const ARTISTS_PATH = "/api/dome-of-doom-artists";
const PAGE_SIZE = 100;

// Split "DMVU, Finnoh" / "DMVU & FINNOH" / "ZOF, DMVU, Babyweight" / "A x B"
// into individual artist names (case-insensitive separators).
export function splitArtistString(str) {
  if (!str) return [];
  const norm = str.trim();
  if (!norm || norm.toUpperCase() === "DOMEOFDOOM") return [];
  return norm
    .split(/\s*,\s*|\s+&\s+|\s+[xX]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Loads all existing Dome of Doom Artist entries into a name(upper) -> { docId, name } map.
export async function loadArtistCache() {
  const cache = new Map();
  let page = 1;
  while (true) {
    const res = await strapiGet(
      ARTISTS_PATH,
      {
        "fields[0]": "name",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    for (const a of res.data) {
      const name = (a.name ?? a.attributes?.name ?? "").trim();
      const docId = a.documentId ?? a.id;
      if (name) cache.set(name.toUpperCase(), { docId, name });
    }
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return cache;
}

// Returns the documentId for an artist name, creating it in Strapi if missing.
export async function ensureArtist(cache, rawName) {
  const name = rawName.trim();
  const key = name.toUpperCase();
  if (cache.has(key)) return cache.get(key).docId;

  const res = await strapiPost(ARTISTS_PATH, { data: { name } });
  const docId = res.data?.documentId ?? res.documentId;
  cache.set(key, { docId, name });
  return docId;
}
