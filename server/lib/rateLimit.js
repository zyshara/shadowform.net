// server/lib/rateLimit.js
//
// In-memory per-IP rate limiting. Each route gets an independent counter store;
// the cleanup timer does not keep tests or otherwise idle processes running.

export function createRateLimiter({ windowMs, max }) {
  const store = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, windowMs).unref();

  return function checkRateLimit(key) {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true };
    }
    if (entry.count >= max) {
      return { allowed: false, retryAfterMs: entry.resetAt - now };
    }
    entry.count++;
    return { allowed: true };
  };
}

// req.ip respects the app's explicitly configured trusted proxy boundary.
export function rateLimit({ message = "Too many requests. Please try again later.", ...options }) {
  const check = createRateLimiter(options);
  return (req, res, next) => {
    const result = check(req.ip || req.socket?.remoteAddress || "unknown");
    if (result.allowed) return next();
    res.setHeader("Retry-After", String(Math.ceil(result.retryAfterMs / 1000)));
    res.status(429).json({ error: message });
  };
}
