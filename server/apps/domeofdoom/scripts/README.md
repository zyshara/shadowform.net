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
