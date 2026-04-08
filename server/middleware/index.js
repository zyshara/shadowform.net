/* ───────────────────────────────────────────────
   SSL redirect (safe)
─────────────────────────────────────────────── */
export function sslRedirect(req, res, next) {
  const host = req.header("host") || "";
  const proto = req.header("x-forwarded-proto");

  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return next();
  }

  if (proto !== "https" || host === "www.shadowform.net") {
    return res.redirect(302, `https://shadowform.net${req.url}`);
  }

  next();
}

/* ───────────────────────────────────────────────
   No-cache for HTML
─────────────────────────────────────────────── */
export function noCacheHtml(req, res, next) {
  if (req.path.match(/\.(js|css|png|jpg|svg|ico|map)$/)) {
    return next();
  }

  res.setHeader("Cache-Control", "no-store");
  next();
}

/* ───────────────────────────────────────────────
   Strip trailing slashes
─────────────────────────────────────────────── */
export function stripTrailingSlash(req, res, next) {
  // Do NOT touch swatchbook or management URLs
  if (req.originalUrl.startsWith("/creative/swatchbook")) return next();
  if (req.originalUrl.startsWith("/management")) return next();

  if (req.originalUrl.length > 1 && req.originalUrl.endsWith("/")) {
    return res.redirect(301, req.originalUrl.slice(0, -1));
  }

  next();
}
