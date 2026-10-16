// server/domeofdoom/cron/fetchAndCacheStrapiData.js
//
// Pulls DomeofDoomCatalogItem AND DomeOfDoomArtist from Strapi, normalizes
// each (override ?? derived), and caches them in memory - same pattern as
// the old bandcampCache.js (getDiscography/getRoster/etc): server/routes/
// spas.js reads these caches to seed the domeofdoom client bundle on each
// request, so the browser never has to fetch Strapi directly. Runs on its
// own fast interval (every 5 min, see index.js) separate from the daily
// scrape/backfill jobs, since this is just re-reading what those already
// wrote.
//
// Artists used to be handled differently - the client read the Bandcamp-
// scraped roster cache directly (bandcampCache.js's getRoster()) with only
// overrides.profile_picture merged on top from Strapi. Now the whole
// roster comes from here instead, same as catalog items - Strapi is the
// 100% source of truth client-side, the Bandcamp scrape is just what feeds
// derived/bandcamp_raw_data server-side. (getRoster() itself still exists
// and still gets scraped into - server/cron/syncShows.js and
// models/show.js still use it for the Shows page - this only changes
// where the ROSTER PAGE's data comes from.)

import { strapiGetAllPages } from "#lib/strapi.js";
import { setCatalogItems } from "#apps/domeofdoom/strapiCatalogCache.js";
import { setArtists } from "#apps/domeofdoom/strapiArtistCache.js";
import { refreshCacheBustToken } from "#apps/domeofdoom/cacheBustToken.js";
import { normalizeCatalogItems } from "#apps/domeofdoom/models/catalogItem.js";
import { normalizeArtists } from "#apps/domeofdoom/models/artist.js";
import { logger } from "#lib/logger.js";

const CATALOG_ITEMS_PATH = "/api/dome-of-doom-catalog-items";
const ARTISTS_PATH = "/api/dome-of-doom-artists";
const POPULATE_PARAMS = {
  "populate[derived][populate]": "*",
  "populate[overrides][populate]": "*",
};

export async function fetchAndCacheStrapiData() {
  const [rawItems, rawArtists] = await Promise.all([
    strapiGetAllPages(CATALOG_ITEMS_PATH, POPULATE_PARAMS),
    strapiGetAllPages(ARTISTS_PATH, POPULATE_PARAMS),
  ]);

  const items = normalizeCatalogItems(rawItems);
  const artists = normalizeArtists(rawArtists);
  setCatalogItems(items);
  setArtists(artists);
  refreshCacheBustToken();

  logger.info(`[domeofdoomCache] cached ${items.length} catalog item(s), ${artists.length} artist(s)`);
  return { count: items.length, artistCount: artists.length };
}
