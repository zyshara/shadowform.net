# Low Poly

`registerSpa.js` mounts this tenant through `server/lib/registerSsrApp.js`:
Vite middleware in development (HMR port 24679), built client assets and
React Router SSR in production.

Routes live in `src/low-poly/app`: `/`, `/epk`, and a catch-all returning 404.
The EPK route loader calls `server/lib/epk.js` with the tenant's fixed
`artistSlug`, then normalizes the result with `server/models/epk.js`.
There is no standalone `/api/epk` endpoint.

The shared Strapi client caches successful responses in memory for five
minutes by default (`STRAPI_CACHE_TTL_MS` overrides this in milliseconds).
Expired data is refreshed on demand; there is no EPK refresh cron.
Page HTML is rendered per request, with metadata, favicon and font preloads.
`npm run build:ssr` builds both SSR tenants and runs as part of `npm run build`.
