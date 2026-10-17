# server/lib/

Tenant-agnostic infrastructure — nothing in here knows which app is calling
it. If a file here ever needs to know "which app," it belongs in
`server/apps/<name>/` instead.

## Contents

- `strapi.js` — the Strapi HTTP client: `strapiGet` (with a short-TTL
  per-URL cache), `strapiGetAllPages` (auto-paginates a collection),
  `strapiPost`/`strapiPut`, media upload, `resolveMediaUrl`, and
  `invalidateCache`.
- `appsConfig.js` — reads `config/apps.json` once; exports `matchesAppHost`/
  `requireAppHost` (the host-scoping each app's `registerApi`/`registerSpa`
  uses) and `canonicalHostRedirect`.
- `epk.js` — `getEpkBySlug`: the cached Strapi fetch shared by the Redspear
  and Low Poly SSR route loaders, scoped by each tenant's fixed `artistSlug`.
- `registerSsrApp.js` — shared tenant SSR registration, Vite middleware in
  development and built client/server assets in production.
- `logger.js` — the shared logger.
- `rateLimit.js` — `createRateLimiter`: a per-IP in-memory rate limiter
  factory, used by contact/guestbook/auth routes.
- `createEntityCache.js` — `createEntityCache`: a get/set in-memory
  singleton factory, used by the app-level caches (e.g.
  `server/apps/domeofdoom/bandcampCache.js`).
- `populate.js` — `artistPopulate`: builds the Strapi populate params
  shared by every route that reads artist relations (EPK, management,
  domeofdoom's own artist sync).
- `metadata.js` — resolves an app's metadata (from `config/apps.json`, via
  `appsConfig.js`) down to one page's tags — used both at webpack build
  time and at request time for per-page overrides like `/epk` — plus the
  HTML meta-tag injection helpers (`injectPageMeta`/`servePageHtml`).
- `cloudinary.js` — `cdnImg`: wraps an image URL for Cloudinary delivery.
- `formatCompactNumber.js` — formats a number with k/M suffixes (e.g.
  1500 → "1.5k").
- `paths.js` — `projectRoot`: the one computed repo-root path, used
  anywhere server code needs to read from `dist/`/`public/`/`src/`.
