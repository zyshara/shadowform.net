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

/**
 * Map a raw Strapi artist entry → the shape Management.jsx expects.
 */
export function normalizeArtist(entry) {
  const a = entry.attributes ?? entry; // works with both Strapi v4 and v5

  return {
    id:            entry.id ?? a.id,
    name:          a.name,
    primary_genre: a.primary_genre?.Name,
    location:      a.location,
    genres:        a.genres?.map((g) => g?.Name) ?? [],
    blurb:         a.blurb_biography ?? "",
    icon:          a.icon?.url,
    links:         a.social_links?.map((l) => ({ label: l.platform, url: l.url })) ?? [],
    status:        a.status ?? "active",
  };
}
