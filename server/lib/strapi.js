// server/lib/strapi.js

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

export async function strapiPost(path, payload) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    const err  = new Error(`Strapi ${res.status}: ${res.statusText}`);
    err.body   = body;
    throw err;
  }
  return res.json();
}

/**
 * Upload a file to Strapi's media library.
 * @param {Buffer} buffer - file buffer
 * @param {string} filename - e.g. "drawing-123.png"
 * @param {string} mimeType - e.g. "image/png"
 * @returns {object} uploaded file object from Strapi
 */
export async function strapiUploadMedia(buffer, filename, mimeType = "image/png") {
  const formData = new FormData();
  formData.append("files", new Blob([buffer], { type: mimeType }), filename);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method:  "POST",
    headers: { ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }) },
    // no Content-Type header — let fetch set the multipart boundary automatically
    body:    formData,
  });

  if (!res.ok) {
    const body = await res.text();
    const err  = new Error(`Strapi upload ${res.status}: ${res.statusText}`);
    err.body   = body;
    throw err;
  }

  const uploaded = await res.json();
  return uploaded?.[0] ?? null;
}

export async function strapiPut(path, payload) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method:  "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    const err  = new Error(`Strapi ${res.status}: ${res.statusText}`);
    err.body   = body;
    throw err;
  }
  return res.json();
}

export function invalidateCache(path, params = {}) {
  if (!path) {
    cache.clear();
    console.log("[strapi] cache cleared");
    return;
  }
  const query   = new URLSearchParams(params).toString();
  const fullUrl = `${STRAPI_URL}${path}${query ? `?${query}` : ""}`;
  cache.delete(fullUrl);
  console.log("[strapi] cache invalidated:", fullUrl);
}
