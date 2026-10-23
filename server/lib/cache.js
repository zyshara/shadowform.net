// Shared bounded, request-driven cache. Invalidating an in-flight load prevents
// its result from repopulating the cache; existing callers still receive it.
export function cacheTtl() {
  const ttl = Number(process.env.STRAPI_CACHE_TTL_MS ?? 300000);
  return Number.isFinite(ttl) && ttl >= 0 ? ttl : 300000;
}

export function createAsyncCache({ maxEntries = 500 } = {}) {
  const entries = new Map();
  return {
    get(key, load, { ttl = cacheTtl() } = {}) {
      const now = Date.now();
      for (const [k, entry] of entries) {
        if (!entry.pending && entry.expiresAt <= now) entries.delete(k);
      }
      const existing = entries.get(key);
      if (existing) return existing.pending ?? Promise.resolve(existing.value);
      const entry = {};
      entry.pending = Promise.resolve().then(load).then(value => {
        if (entries.get(key) === entry) {
          if (ttl > 0) {
            entry.value = value;
            entry.expiresAt = Date.now() + ttl;
            entry.pending = undefined;
          } else entries.delete(key);
        }
        return value;
      }, error => {
        if (entries.get(key) === entry) entries.delete(key);
        throw error;
      });
      while (entries.size >= maxEntries) entries.delete(entries.keys().next().value);
      entries.set(key, entry);
      return entry.pending;
    },
    invalidate(matches = () => true) {
      for (const key of entries.keys()) if (matches(key)) entries.delete(key);
    },
  };
}

export function cached(load) {
  const cache = createAsyncCache({ maxEntries: 1 });
  return () => cache.get("value", load);
}
