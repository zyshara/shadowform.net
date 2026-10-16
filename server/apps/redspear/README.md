# server/apps/redspear/

The redspear.shadowform.net site. No Strapi models of its own — the EPK
response shape comes from the shared `server/models/epk.js`.

## Contents

- `registerApi.js` — `registerRedspearApi`: registers redspear's own
  `GET /api/epk` (no slug param — the subdomain already tells us which
  artist; its fixed `artistSlug` comes from `config/apps.json`), scoped to
  its own hostnames by `server/routes/api.js`. The actual Strapi fetch is
  shared with low-poly via `server/lib/epk.js`; the route registration
  itself is redspear's own.
- `registerSpa.js` — `registerRedspearSpa`: host-sniffs for `redspear.*`,
  serves the built SPA, and special-cases `/epk` to inject per-page
  metadata (title/OG tags) from `config/apps.json` before crawlers see it.
