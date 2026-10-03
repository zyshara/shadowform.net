// server/lib/rateLimit.js
//
// Minimal in-memory per-IP rate limiter, same approach as
// server/domeofdoom/contact.js's checkRateLimit. Returns a function you can
// call per-request; each call site gets its own independent counter store.

export function createRateLimiter({ windowMs, max }) {
  const store = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, windowMs);

  return function checkRateLimit(key) {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= max) return false;
    entry.count++;
    return true;
  };
}
