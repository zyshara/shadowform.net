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
  serves Vite middleware and React Router SSR in development, or client
  assets and the SSR bundle in production, via `server/lib/registerSsrApp.js`.
  Its HMR websocket uses port 24679 (Redspear uses 24678).

Routes live in `src/low-poly/app`: `/`, `/epk`, and a catch-all page.
The EPK loader fetches Strapi data on the server. Metadata, favicon, and
font preloads are included in the initial HTML. `npm run build:ssr` builds
both SSR tenants and is included in `npm run build`.
