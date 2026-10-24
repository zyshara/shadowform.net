// Public, read-only route data only. Each browser tab owns this memory;
// nothing is persisted or shared between server requests. Entries live until
// a full page reload/tab close, or eviction by the memory bound below.
export function createCachedClientLoader({ maxEntries = 30 } = {}) {
  const entries = new Map();
  const pending = new Map();
  const cancelled = Symbol("cancelled preload");
  async function clientLoader({ request, serverLoader }) {
    // These routes filter/sort locally; query strings do not change server data.
    const key = new URL(request.url).pathname;
    const cached = entries.get(key);
    if (cached) return cached.data;

    let data;
    try {
      const existing = pending.get(key);
      if (existing && !existing.signal.aborted) {
        // Cancellation belongs to the original fetcher, not its consumers.
        let onAbort;
        const aborted = new Promise(resolve => {
          onAbort = () => resolve(cancelled);
          existing.signal.addEventListener("abort", onAbort, { once: true });
        });
        try {
          data = await Promise.race([existing.promise, aborted]);
        } catch (error) {
          if (!existing.signal.aborted) throw error;
          data = cancelled;
        } finally {
          existing.signal.removeEventListener("abort", onAbort);
        }
        if (data !== cancelled && !existing.signal.aborted) return data;
        // Recheck the pending map so multiple surviving consumers share
        // the replacement request too.
        return clientLoader({ request, serverLoader });
      }

      const entry = { signal: request.signal };
      entry.promise = Promise.resolve().then(serverLoader);
      pending.set(key, entry);
      try {
        data = await entry.promise;
      } finally {
        if (pending.get(key) === entry) pending.delete(key);
      }
    } catch (error) {
      // A speculative hover request must not replace the current page with
      // an error boundary. Real navigation still surfaces errors normally.
      if (new URL(request.url).searchParams.get("_preload") === "1") return null;
      throw error;
    }
    // Do not retain cancelled loads, errors, redirects, or HTTP responses.
    if (!request.signal.aborted && !(data instanceof Response)) {
      if (entries.size >= maxEntries) entries.delete(entries.keys().next().value);
      entries.set(key, { data });
    }
    return data;
  }
  // React Router supplies SSR data to serverLoader during hydration, so the
  // initial page seeds this cache without a duplicate network request.
  clientLoader.hydrate = true;
  return clientLoader;
}
