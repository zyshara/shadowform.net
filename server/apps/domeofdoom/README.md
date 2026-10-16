# server/apps/domeofdoom/

The Dome of Doom record label site (domeofdoom.org / domeofdoom.shadowform.net).
The deepest app here — real Strapi content pipelines, Bandcamp scraping,
and background sync jobs, not just routes.

## Contents

- `registerApi.js` — `registerDomeOfDoomApi`: registers domeofdoom's API
  routes (contact, press). Mounted behind its own host guard by
  `server/routes/api.js`.
- `registerSpa.js` — `registerDomeOfDoomSpa`: the SPA static-serving route —
  seeds roster/merch/shows/about-page/catalog data into the HTML on each
  request.
- `contact.js` — `POST /api/contact` (rate-limited contact form, emails via
  nodemailer).
- `press.js` — press/press-outlets routes.
- `artists.js` — DomeOfDoomArtist name-splitting/matching helpers
  (`splitArtistString`, `slugifyArtistName`, `loadArtistCache`,
  `ensureArtist`) shared by the catalog/backfill cron jobs.
- `strapiArtists.js` — `getArtists`/`getArtistBySlug` against the *generic*
  `/api/artists` content type (not DomeOfDoomArtist) — used internally by
  `cron/syncStats.js`, no HTTP routes of its own.
- `spotifyApi.js` — raw Spotify Web API client (token handling, search).
- `bandcampCache.js` — in-memory cache for Bandcamp-scraped data (roster,
  merch, shows, about-page).
- `strapiArtistCache.js` / `strapiCatalogCache.js` — in-memory caches for
  the normalized DomeOfDoomArtist / catalog-item lists Strapi is the source
  of truth for.
- `cacheBustToken.js` — the `?v=<token>` cache-busting value for artist
  photo URLs, refreshed whenever Strapi data is re-pulled.
- `cron/` — every scheduled job. See its README.
- `scrapers/` — Bandcamp/Spotify/Instagram/Bandsintown scraping helpers
  used by the cron jobs. See its README.
- `models/` — Strapi response normalizers specific to domeofdoom's own
  content types. See its README.
- `scripts/` — one-off manual backfill scripts, not wired into cron. See
  its README.
