/* ───────────────────────────────────────────────
   SSL redirect (safe)
─────────────────────────────────────────────── */
export function sslRedirect(req, res, next) {
  const host = req.header("host") || "";
  const hostname = host.split(":")[0];
  const proto = req.header("x-forwarded-proto");

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")) {
    return next();
  }

  if (proto !== "https" || hostname === "www.shadowform.net") {
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
