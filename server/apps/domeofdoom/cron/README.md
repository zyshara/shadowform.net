# Dome of Doom ingestion jobs

`index.js` schedules a batch at midnight and noon America/Los_Angeles:

1. `scrapeBandcampAndSyncStrapi.js` imports Bandcamp catalog and artists into Strapi.
2. `backfillCatalogItems.js` derives catalog entries from imported raw records.
3. `backfillArtistSpotify.js` fills missing artist Spotify information.
4. `server/cron/artistStats.js` updates artist statistics from Spotify, Instagram and Bandsintown.

These jobs maintain CMS content. SSR reads Strapi on demand with a short data
cache and never triggers scraping. The former five-minute catalog/artist refresh
and daily roster, merch, shows and about-page cache jobs have been removed.

`dryRunArtistExtraction.js` remains a manual read-only diagnostic, not scheduled.

Catalog Spotify URLs can be backfilled manually with:

```sh
node --env-file=.env server/apps/domeofdoom/scripts/backfillCatalogSpotify.js
node --env-file=.env server/apps/domeofdoom/scripts/backfillCatalogSpotify.js --apply
SPOTIFY_BACKFILL_REPORT=/tmp/dod-spotify-ep-backfill.json node --env-file=.env server/apps/domeofdoom/scripts/backfillCatalogSpotify.js --apply --ep-only
```

The first command is read-only. The second fills missing `overrides.spotify_url`
values only when title, primary artist, release year, and Dome of Doom label or
copyright ownership agree on one album. Existing URLs are preserved.
EP searches omit a standalone trailing `EP` or `(EP)`; matching allows that
suffix difference while preserving the artist, year, and ownership checks.
The `--ep-only` option limits the run to EPs with missing URLs.
Each write is read back for verification. Ambiguous and unmatched items remain for
manual review. The report defaults to `/tmp/dod-spotify-backfill.json`; set
`SPOTIFY_BACKFILL_REPORT` to choose another location. Authentication and rate
limit errors stop the run; ordinary failures are recorded without guessed URLs.
