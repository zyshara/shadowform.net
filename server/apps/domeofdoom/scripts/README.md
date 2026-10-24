# server/apps/domeofdoom/scripts/

One-off, manual backfill scripts — **not** wired into cron. Run directly
with `node --env-file=.env server/apps/domeofdoom/scripts/<file>.js
[--dry-run]`.

## Contents

- `backfillArtistSlugs.js` — one-time: sets `DomeOfDoomArtist.slug` for any
  artist missing one (the field was added after existing records already
  existed). Safe to re-run.
- `backfillCatalogNumbersFromDiscography.js` — parses the public
  discography list at domeofdoom.org/artists and backfills
  `catalog_number` for any catalog item missing one, matched by Bandcamp
  URL slug. Writes only into gaps — never overwrites an existing value.
- `missing-catalog-items.md` — a standing list of known catalog gaps the
  script above can't resolve automatically (no matching catalog item
  exists at all yet), kept for manual review.


## Reviewed show inventory

`backfillShows.js` imports the reviewed historical inventory in `data/reviewed-shows.json` using stable source IDs. It reuses the existing HARD Summer document and preserves the separately seeded Maybe Forever and ENTER detail pages. Other imported events have external links and no site-specific page. It uploads/reuses the Nightfall flyer and does not change unrelated CMS records.

```bash
node server/apps/domeofdoom/scripts/backfillShows.js
node server/apps/domeofdoom/scripts/backfillShows.js --apply
node server/apps/domeofdoom/scripts/backfillShows.js --apply --publish
```

The default is an offline dry run. `--apply` writes drafts. `--publish` explicitly publishes only the reviewed set, its five known media items, and its two pages, in dependency order. Requires STRAPI_API_URL and STRAPI_API_TOKEN. The two detail seeds in strapi-shadowform must run first. Rerunning replaces fields owned by this import; use the CMS for subsequent editorial updates rather than rerunning over hand edits.

Shows and Show Page routes now read published Strapi content directly. There is no runtime mock-data fallback or DOD_SHOWS_SOURCE switch. Real historical inventory is retained here as a migration source; UI test fixtures stay under pages/__fixtures__ and are not imported by production routes.

The initial production import on October 23, 2026 published 13 reviewed shows, five media items and two pages; three other legacy published shows were retained. Flyers were verified in the existing Dome of Doom Media Library folder (ID 34), with Cloudinary public IDs unchanged. Future Media Item file organization is implemented in the next strapi-shadowform update; until that update is deployed, API uploads initially land in API Uploads and must be moved through the Media Library or the server upload service.
