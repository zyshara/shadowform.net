# Dome of Doom

The tenant uses React Router SSR with Vite, mounted through
`server/lib/registerSsrApp.js` (development HMR port 24680).

- `registerSsr.js` supplies a request-scoped RouterContextProvider with shared
  server data services. Context keys come from the active build so dev module
  reloads do not split their identity.
- `data.js` loads and normalizes catalog, artists, and shows exclusively from
  Strapi. Complete collection reads have a request-driven five-minute memory
  cache (`STRAPI_CACHE_TTL_MS`), deduplicate concurrent misses, and retry failures.
- `press.js` loads normalized press content through the shared Strapi client.
- `registerApi.js` mounts only `POST /api/contact`; `routes/contact.js` retains email
  validation and rate limiting. Press GET endpoints have been retired.
- `cron/` runs Bandcamp ingestion into Strapi, catalog derivation, artist Spotify
  backfill, and statistics sync twice daily. There are no page-cache cron jobs
  or direct Bandcamp scrapers in the website request path.
- `models/` contains Strapi normalizers; `scripts/` contains manual backfills.
- `artists.js` supports label-specific ingestion. Shared artist reads and Spotify
  access live in `server/lib/artists.js` and `server/lib/spotify.js`; generic
  artist-statistics sync and scrapers live under `server/cron/`.

UI route modules live in `src/domeofdoom/app`; existing interactive components
live in `pages/` and `components/`. Route loaders supply per-page props, metadata,
canonical links, and proper 404s. Detail pages receive only their matching data.
Shows, Merch, About, and Licensing currently remain under-construction pages.
Artist pages can display associated Strapi shows if the records have artist
relations; current records without relations are not assigned speculatively.

No custom seed JSON or background cache warmup is needed. A cold request awaits
Strapi; failures produce an error response rather than an empty success page.
HTML is rendered per request. `npm run build:ssr` includes this tenant; the full
build uses Vite for all four tenants and generates the Dome of Doom sitemap.
