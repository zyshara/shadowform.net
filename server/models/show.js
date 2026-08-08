// server/models/show.js

/**
 * Maps a raw Strapi "Dome of Doom Show" entry → the shape the client expects.
 * Compatible with both Strapi v4 (entry.attributes) and v5 (flat entry).
 */
// Strapi's Dome of Doom Artist relation only stores `name` — it's
// auto-created by the discography sync (see lib/artists.js) and never
// carries a photo. Real artist photos live in the Bandcamp-scraped roster
// cache instead, so `pfpByName` (built from getRoster()) is how a show
// artist's name gets matched to a photo_src.
export function normalizeShow(raw, pfpByName = new Map()) {
  const s = raw?.attributes ?? raw;
  if (!s || !s.name) return null;

  const linkedArtists = Array.isArray(s.artists) ? s.artists : s.artists?.data ?? [];
  const artists = linkedArtists.map((a) => {
    const artist = a.attributes ?? a;
    const pfp = pfpByName.get(artist.name?.trim().toUpperCase()) ?? null;
    return {
      name: artist.name,
      pfp,
    };
  });

  return {
    uid: raw.documentId ?? raw.id,
    name: s.name,
    date: s.date ?? null,
    link: s.link ?? null,
    artists,
  };
}

export function normalizeShows(list = [], pfpByName = new Map()) {
  return list.map((raw) => normalizeShow(raw, pfpByName)).filter(Boolean);
}
