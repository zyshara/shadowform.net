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

  if (hostname === "www.shadowform.net") {
    return res.redirect(302, `https://shadowform.net${req.url}`);
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
  // Do NOT touch swatchbook URLs
  if (req.originalUrl.startsWith("/creative/swatchbook")) return next();

  if (req.originalUrl.length > 1 && req.originalUrl.endsWith("/")) {
    return res.redirect(301, req.originalUrl.slice(0, -1));
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
