// server/middleware/index.js
//
// Generic, tenant-agnostic Express middleware applied to every request in
// server.js: HTTPS/host redirects, no-cache for HTML, trailing-slash
// stripping, and the shared-Strapi-user-pool auth guard.

/* ───────────────────────────────────────────────
   SSL redirect (safe)

   Host canonicalization (www stripping, domeofdoom.org vs. its
   subdomain, etc.) is handled separately by canonicalHostRedirect
   (see lib/appsConfig.js) — this one only upgrades http -> https.
─────────────────────────────────────────────── */
export function sslRedirect(req, res, next) {
  const host = req.header("host") || "";
  const hostname = host.split(":")[0];
  const proto = req.header("x-forwarded-proto");

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost")) {
    return next();
  }

  if (proto !== "https") {
    return res.redirect(302, `https://${hostname}${req.url}`);
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
  // Only normalize the pathname: query values can legitimately end in "/"
  // (React Router requests critical.css?pathname=/ for the home page).
  const queryIndex = req.originalUrl.indexOf("?");
  const pathname = queryIndex === -1 ? req.originalUrl : req.originalUrl.slice(0, queryIndex);
  const search = queryIndex === -1 ? "" : req.originalUrl.slice(queryIndex);
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return res.redirect(301, pathname.slice(0, -1) + search);
  }

  next();
}

/* ───────────────────────────────────────────────
   Require auth — forwards the caller's JWT to
   Strapi's own GET /api/users/me rather than
   verifying it locally, so there's no secret to
   keep in sync between this app and Strapi's.
   Attaches the Strapi user to req.user on success.
─────────────────────────────────────────────── */
const STRAPI_URL = process.env.STRAPI_API_URL || "https://strapi-shadowform-52c53315c615.herokuapp.com";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const meRes = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: header },
    });
    if (!meRes.ok) {
      return res.status(401).json({ error: "invalid or expired token" });
    }
    req.user = await meRes.json();
    req.jwt = header.slice(7);
    next();
  } catch {
    res.status(502).json({ error: "could not verify session" });
  }
}
