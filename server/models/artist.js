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

import { cdnImg } from "../utils/cloudinary.js";
import { formatCompactNumber } from "../utils/formatCompactNumber.js";

function createArtistStats(data) {
  return [
    { label: "Spotify Monthly",     value: formatCompactNumber(data?.spotify_monthly_listeners) },
    { label: "Instagram Followers", value: formatCompactNumber(data?.instagram_followers) },
    { label: "Upcoming Shows",      value: formatCompactNumber(data?.upcoming_shows) },
    { label: "Shows Played",        value: formatCompactNumber(data?.shows_played) },
    { label: "Total Releases",      value: formatCompactNumber(data?.total_releases) },
  ];
}

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
  const spotify_url = overrides.spotify_url || derived.spotify_url || null;

  return {
    uid: raw.documentId ?? raw.id,
    name,
    slug: r.slug ?? null,
    photo_src: cdnImg(photoSrc, 400),
    location,
    url,
    spotify_url,
  };
}

export function normalizeArtists(list = []) {
  return list.map(normalizeArtist).filter(Boolean);
}

// Rich shape for EPK pages (bio, stats, booking contacts) - distinct from
// normalizeArtist() above, which only returns the lean fields the Dome of
// Doom roster cards need. Shares the same derived/overrides/bandcamp_raw_data
// resolution for name/location so overrides still apply, but the EPK-only
// fields (biography, stats, genres, bookings) come straight off the raw
// Strapi relations, which are unaffected by the roster-card restructuring.
export function normalizeArtistForEpk(raw) {
  const r = raw?.attributes ?? raw;
  if (!r) return null;

  const derived = r.derived ?? {};
  const overrides = r.overrides ?? {};
  const bandcampRaw = r.bandcamp_raw_data ?? {};

  const name = overrides.name || derived.name || r.name || null;
  if (!name) return null;

  const location = overrides.location || bandcampRaw.location || r.location || null;

  return {
    id: raw.documentId ?? raw.id,
    slug: r.slug ?? null,
    name,
    primary_genre: r.primary_genre?.Name ?? r.primary_genre?.name ?? null,
    location,
    genres: r.genres?.map((g) => g?.Name ?? g?.name).filter(Boolean) ?? [],
    blurb: r.blurb_biography ?? "",
    biography: r.biography ?? "",
    icon: resolveMediaUrl(r.icon),
    stats: createArtistStats(r.artist_statistics),
    bookings: r.booking_email ?? "",
    management: r.management_email ?? "",
  };
}
