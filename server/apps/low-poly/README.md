# server/apps/low-poly/

The low-poly.shadowform.net site. Same shape as `../redspear/` — no
Strapi models of its own; the EPK response shape comes from the shared
`server/models/epk.js`.

## Contents

- `registerApi.js` — `registerLowPolyApi`: registers low-poly's own
  `GET /api/epk` (no slug param — the subdomain already tells us which
  artist; its fixed `artistSlug` comes from `config/apps.json`), scoped to
  its own hostnames by `server/routes/api.js`. The actual Strapi fetch is
  shared with redspear via `server/lib/epk.js`; the route registration
  itself is low-poly's own.
- `registerSpa.js` — `registerLowPolySpa`: host-sniffs for `low-poly.*`,
  serves the built SPA, and special-cases `/epk` to inject per-page
  metadata from `config/apps.json` before crawlers see it.
