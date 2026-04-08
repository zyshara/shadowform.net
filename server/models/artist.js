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
export function normalizeArtist(entry) {
  const a = entry.attributes ?? entry;

  return {
    id:            entry.id ?? a.id,
    slug:          a.slug,
    name:          a.name,
    primary_genre: a.primary_genre?.Name,
    location:      a.location,
    genres:        a.genres?.map((g) => g?.Name) ?? [],
    blurb:         a.blurb_biography ?? "",
    biography:     a.biography ?? "",
    icon:          a.icon?.url,
    links:         a.management_page_card_links?.map((l) => ({ label: l.label?.text, url: l.url?.url })) ?? [],
    stats:         createArtistStats(a.artist_statistics),
    bookings:      a.booking_email ?? "",
    management:    a.management_email ?? "",
  };
}
