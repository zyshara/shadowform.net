// server/models/release.js

/**
 * Maps a raw Strapi dome-of-doom-release entry → the shape the client
 * expects. Compatible with both Strapi v4 (entry.attributes) and v5 (flat
 * entry), matching the other normalizers in this directory.
 */
export function normalizeRelease(raw) {
  const r = raw?.attributes ?? raw;
  if (!r || !r.name || !r.artist) return null;

  return {
    artist:        r.artist,
    release_name:  r.name,
    cover_art_src: r.bandcamp_artwork_url ?? null,
    type:          r.type ?? null,
    year:          r.year ?? null,
    spotify_url:   r.spotify_url ?? null,
    bandcamp_url:  r.bandcamp_url ?? null,
  };
}

export function normalizeReleases(list = []) {
  return list.map(normalizeRelease).filter(Boolean);
}
