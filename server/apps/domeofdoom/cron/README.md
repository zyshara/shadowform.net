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
