// server/models/artist.js
//
// Normalizes an entry from the generic /api/artists content type (not
// DomeOfDoomArtist — see server/domeofdoom/models/artist.js for that one).
// Shared by the EPK page (redspear, low-poly, ...) and the management page,
// both of which read artist cards/bios off this same generic content type.

import { resolveMediaUrl } from "#lib/strapi.js";
import { formatCompactNumber } from "#lib/formatCompactNumber.js";

function createArtistStats(data) {
  return [
    { label: "Spotify Monthly",     value: formatCompactNumber(data?.spotify_monthly_listeners) },
    { label: "Instagram Followers", value: formatCompactNumber(data?.instagram_followers) },
    { label: "Upcoming Shows",      value: formatCompactNumber(data?.upcoming_shows) },
    { label: "Shows Played",        value: formatCompactNumber(data?.shows_played) },
    { label: "Total Releases",      value: formatCompactNumber(data?.total_releases) },
  ];
}

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
