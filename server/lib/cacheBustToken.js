// server/lib/cacheBustToken.js
//
// A single in-memory value for cache-busting client-facing image URLs
// (as a `?v=<token>` query string) - initialized once at server start
// and otherwise only refreshed when we pull fresh data from Strapi (see
// fetchAndCacheStrapiData.js's call to refreshCacheBustToken()), not on
// every request. That keeps browsers from re-fetching images on every
// page load while still forcing a re-fetch the moment the data behind
// a URL (e.g. an artist's profile_picture override) actually changes.
// Same singleton-module-state shape as bandcampCache.js.

let cacheBustToken = Date.now();

export function getCacheBustToken() {
  return cacheBustToken;
}

export function refreshCacheBustToken() {
  cacheBustToken = Date.now();
  return cacheBustToken;
}

// Appends the current token as a query param, adding "?" or "&" as
// needed depending on whether `url` already has a query string. No-ops
// on falsy input so callers can pass optional/missing URLs straight
// through without a guard at the call site.
export function withCacheBust(url) {
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${cacheBustToken}`;
}
