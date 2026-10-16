# server/apps/domeofdoom/cron/

Every scheduled job for domeofdoom, registered by `index.js` on three
schedules: a 5-minute cache refresh, a twice-daily scrape/backfill batch,
and daily syncs (registered directly in `cron/index.js` at the top of
`server/apps/domeofdoom/`, not here).

## Contents

- `index.js` — the schedule: wires every job below to `node-cron`.
- `fetchAndCacheStrapiData.js` — every 5 min: re-reads catalog items +
  artists from Strapi into the in-memory caches (read-only, cheap).
- `scrapeBandcampAndSyncStrapi.js` — twice daily: scrapes the live Bandcamp
  catalog/roster and upserts raw items + artists into Strapi.
- `backfillCatalogItems.js` — twice daily: derives catalog items from the
  raw Bandcamp scrape, resolving/creating artists and formats as needed.
- `backfillArtistSpotify.js` — twice daily: resolves missing
  `spotify_url`/description for artists.
- `syncStats.js` — twice daily: scrapes Spotify/Instagram/Bandsintown stats
  per artist and writes them to Strapi's artist-statistics type.
- `syncShows.js` — daily (after the roster scrape): pulls Dome of Doom
  Shows from Strapi, attaches roster photos, caches the result.
- `syncAboutPage.js` — daily: re-reads and caches the About Page
  single-type.
- `dryRunArtistExtraction.js` — **not scheduled.** Manual read-only
  exploration tool for previewing what an artist-name extraction pass would
  surface, without writing anything. Run directly with `node`.
