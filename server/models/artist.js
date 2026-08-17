// server/models/artist.js
//
// Maps a raw Strapi DomeOfDoomArtist entry -> the shape the client expects
// (name, slug, photo_src, location, url) - same overrides ?? derived ??
// raw-scrape fallback pattern catalogItem.js uses, so the Roster/Artist
// pages become 100% Strapi-sourced the same way CatalogItem already is,
// instead of reading the separate Bandcamp-scrape-only roster cache.
//
// location has no home in `derived` (Strapi's derived COMPONENT schema
// doesn't define that field - confirmed by a live write attempt getting
// rejected with a validation error, not silently dropped) so it's read
// from bandcamp_raw_data instead, which is a schemaless json field and
// always round-trips whatever the scraper wrote to it.
//
// overrides fields beyond profile_picture (e.g. a location/name override)
// aren't confirmed to exist in Strapi's overrides component schema yet -
// referencing them here is harmless if they don't (just undefined, falls
// through to the next fallback) but they won't actually DO anything until
// added to Strapi, same as slug needed to be added before it was usable.

function resolveMediaUrl(media) {
  const url = media?.url;
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  const base = process.env.STRAPI_API_URL || "https://strapi-shadowform-52c53315c615.herokuapp.com";
  return `${base}${url}`;
}

export function normalizeArtist(raw) {
  const r = raw?.attributes ?? raw;
  if (!r) return null;

  const derived = r.derived ?? {};
  const overrides = r.overrides ?? {};
  const bandcampRaw = r.bandcamp_raw_data ?? {};

  const name = overrides.name || derived.name || r.name || null;
  if (!name) return null;

  const photoSrc =
    resolveMediaUrl(overrides.profile_picture) || derived.bandcamp_image || bandcampRaw.imageUrl || null;
  const location = overrides.location || bandcampRaw.location || null;
  const url = overrides.bandcamp_url || derived.bandcamp_url || bandcampRaw.bandcampUrl || null;

  return {
    uid: raw.documentId ?? raw.id,
    name,
    slug: r.slug ?? null,
    photo_src: photoSrc,
    location,
    url,
  };
}

export function normalizeArtists(list = []) {
  return list.map(normalizeArtist).filter(Boolean);
}
