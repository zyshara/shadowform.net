# server/lib/

Shared infrastructure and data access. Tenant-specific behavior is supplied
through configuration or app registration; business rules stay in
`server/apps/<name>/`.

## Contents

- `strapi.js` — the Strapi HTTP client: `strapiGet` (with a short-TTL
  per-URL cache), `strapiGetAllPages` (auto-paginates a collection),
  `strapiPost`/`strapiPut`, media upload, `resolveMediaUrl`, and
  `invalidateCache`.
- `appsConfig.js` — reads `config/apps.json` once; exports `matchesAppHost`/
  `requireAppHost` (the host-scoping each tenant uses) and `canonicalHostRedirect`.
- `epk.js` — `getEpkBySlug`: the cached Strapi fetch shared by the Redspear
  and Low Poly SSR route loaders, scoped by each tenant's fixed `artistSlug`.
- `registerSsrApp.js` — shared tenant SSR registration, Vite middleware in
  development and built client/server assets in production.
- `logger.js` — the shared logger.
- `rateLimit.js` — `createRateLimiter`: a per-IP in-memory rate limiter
  factory, used by contact/guestbook/auth routes.
- `populate.js` — `artistPopulate`: builds the Strapi populate params
  shared by every route that reads artist relations (EPK, management,
  domeofdoom's own artist sync).
- `cloudinary.js` — `cdnImg`: wraps an image URL for Cloudinary delivery.
- `formatCompactNumber.js` — formats a number with k/M suffixes (e.g.
  1500 → "1.5k").
- `paths.js` — `projectRoot`: the one computed repo-root path, used
  anywhere server code needs to read from `dist/`/`public/`/`src/`.

- `cache.js` — bounded async caches, TTL policy, concurrent-load deduplication,
  and scoped invalidation. Strapi URL reads and normalized collection reads use
  the same implementation.
- `artists.js` — reads the generic Strapi artist content type for shared stats.
- `spotify.js` — shared Spotify API/token client used by ingestion and stats.

The Strapi transport shares JSON/multipart error handling and a 30-second
request timeout. `noCache` bypasses reads and writes. `invalidateCache(path)`
clears populated/filtered variants and details for that endpoint;
`invalidateCache(path, params)` targets one exact query. No argument clears all.

## Logging

Use `createLogger(scope)` once per module, then
`log.info("functionName", "message", { details })` (or debug/warn/error).
Tenant work uses `domeofdoom`, `shadowform`, `redspear`, or `low-poly` as its
scope; shared services use `strapi`, `spotify`, `notion`, `googleCalendar`, etc.
Output is `timestamp [level] [scope][method] message`, followed by real objects.
Pass an Error object to retain its stack/status; do not pass upstream bodies.

Strapi logs actual outbound requests at info as `[strapi][GET] URL` (POST/PUT
likewise). Query parameters are decoded into a separate `query` object;
responses include status/duration, and failures include safe error details.
Cache hits do not pretend to be network requests. Payloads, auth headers, and
media contents are not logged. The logger redacts credential-like object keys,
Bearer values, and secret URL query parameters. The manual Google token setup
helper intentionally prints credentials for the operator to copy; it is not
part of runtime logging.

`LOG_LEVEL=debug|info|warn|error|silent` controls verbosity. Defaults are debug
in development and info in production. Request completion logs use the tenant
scope and HTTP method, with status/duration. Successful generated/shared asset
requests are debug; page/API requests are info; 4xx/5xx are warn/error.
