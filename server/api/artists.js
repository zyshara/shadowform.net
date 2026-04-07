// server/api/artists.js

import { strapiGet } from "./strapi.js";

export async function getArtists(params = {}, opts = {}) {
  return strapiGet("/api/artists", {
    "populate[management_page_card_links][populate][label]": "*",
    "populate[management_page_card_links][populate][url]":   "*",
    "populate[icon][fields]": "*",
    "populate[artist_statistics][fields]": "*",
    "populate[primary_genre]": "*",
    "populate[genres]": "*",
    "populate[instagram]": "*",
    "populate[spotify]":   "*",
    "populate[songkick]":  "*",
    "pagination[pageSize]": "100",
    ...params,
  }, opts);
}

export async function getArtistBySlug(slug, opts = {}) {
  return getArtists({ "filters[slug][$eq]": slug }, opts);
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
}

function createArtistStats(data) {
  return [
     {
        label: "Spotify Monthly",
        value: formatNumber(data?.spotify_monthly_listeners),
     },
     {
        label: "Instagram Followers",
        value: formatNumber(data?.instagram_followers),
     },
     {
        label: "Upcoming Shows",
        value: formatNumber(data?.upcoming_shows),
     },
     {
        label: "Shows Played",
        value: formatNumber(data?.shows_played),
     },
     {
        label: "Total Releases",
        value: formatNumber(data?.total_releases),
     },
  ];
}

/**
 * Map a raw Strapi artist entry → the shape Management.jsx expects.
 */
export function normalizeArtist(entry) {
  const a = entry.attributes ?? entry; // works with both Strapi v4 and v5

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
  };
}
