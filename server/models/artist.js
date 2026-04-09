import { formatCompactNumber } from "../utils/formatCompactNumber.js";

function createArtistStats(data) {
  return [
    { label: "Spotify Monthly",    value: formatCompactNumber(data?.spotify_monthly_listeners) },
    { label: "Instagram Followers", value: formatCompactNumber(data?.instagram_followers) },
    { label: "Upcoming Shows",     value: formatCompactNumber(data?.upcoming_shows) },
    { label: "Shows Played",       value: formatCompactNumber(data?.shows_played) },
    { label: "Total Releases",     value: formatCompactNumber(data?.total_releases) },
  ];
}

/**
 * Maps a raw Strapi artist entry → the shape the client expects.
 * Compatible with both Strapi v4 (entry.attributes) and v5 (flat entry).
 */
export function normalizeArtist(raw) {
  if (!raw || !raw.id || !raw.name || !raw.slug) return null;

  return {
    id:            raw.id,
    slug:          raw.slug,
    name:          raw.name,
    primary_genre: raw.primary_genre?.Name,
    location:      raw.location,
    genres:        raw.genres?.map((g) => g?.Name) ?? [],
    blurb:         raw.blurb_biography ?? "",
    biography:     raw.biography ?? "",
    icon:          raw.icon?.url,
    stats:         createArtistStats(raw.artist_statistics),
    bookings:      raw.booking_email ?? "",
    management:    raw.management_email ?? "",
  };
}
