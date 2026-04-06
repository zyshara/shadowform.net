// src/shared/api/strapi.js

const STRAPI_URL   = process.env.STRAPI_API_URL   || "https://strapi-shadowform-52c53315c615.herokuapp.com";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// simple in-memory cache: { [cacheKey]: { data, expiresAt } }
const cache = new Map();

/**
 * Fetch from Strapi with auth header, populate support, and in-memory caching.
 * @param {string} path   - e.g. "/api/artists"
 * @param {object} params - query params to append
 * @param {object} opts
 * @param {number}  opts.ttl      - cache TTL in ms (default: CACHE_TTL_MS)
 * @param {boolean} opts.noCache  - bypass cache entirely
 */
export async function strapiGet(path, params = {}, { ttl = CACHE_TTL_MS, noCache = false } = {}) {
  const query    = new URLSearchParams(params).toString();
  const fullUrl  = `${STRAPI_URL}${path}${query ? `?${query}` : ""}`;
  const cacheKey = fullUrl;

  // return cached data if still fresh
  if (!noCache) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      console.log("[strapi] cache hit:", cacheKey);
      return cached.data;
    }
  }

  console.log("[strapi] fetching:", fullUrl);

  const res = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    const err  = new Error(`Strapi ${res.status}: ${res.statusText}`);
    err.body   = body;
    throw err;
  }

  const data = await res.json();

  // store in cache
  cache.set(cacheKey, { data, expiresAt: Date.now() + ttl });

  return data;
}

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

/**
 * Manually invalidate a cached entry (or the whole cache).
 * @param {string} [path] - if omitted, clears everything
 * @param {object} [params]
 */
export function invalidateCache(path, params = {}) {
  if (!path) {
    cache.clear();
    console.log("[strapi] cache cleared");
    return;
  }
  const query    = new URLSearchParams(params).toString();
  const fullUrl  = `${STRAPI_URL}${path}${query ? `?${query}` : ""}`;
  cache.delete(fullUrl);
  console.log("[strapi] cache invalidated:", fullUrl);
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

   console.log(a.artist_statistics);

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
