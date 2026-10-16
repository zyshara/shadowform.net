// server/lib/createEntityCache.js
//
// In-memory singleton for one entity — module state is a natural singleton
// in Node/ESM. A cron job writes via set(); server/routes/spas.js reads via
// get() to seed a client bundle on each request, with no per-request Strapi
// call. See strapi.js's strapiGet cache for the other caching pattern this
// codebase uses (short-TTL, per-URL, for routes with no cron-maintained
// snapshot) — the two are intentionally different tools, not duplicates.

export function createEntityCache(initial) {
  let value = initial;
  return {
    get: () => value,
    set: (next) => { value = next; },
  };
}
