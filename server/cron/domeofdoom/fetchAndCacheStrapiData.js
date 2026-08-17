// server/cron/domeofdoom/fetchAndCacheStrapiData.js
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

import { strapiGet } from "../../lib/strapi.js";
import { setCatalogItems } from "../../lib/strapiCatalogCache.js";
import { setArtists } from "../../lib/strapiArtistCache.js";
import { refreshCacheBustToken } from "../../lib/cacheBustToken.js";
import { normalizeCatalogItems } from "../../models/catalogItem.js";
import { normalizeArtists } from "../../models/artist.js";
import { logger } from "../../lib/logger.js";

const CATALOG_ITEMS_PATH = "/api/dome-of-doom-catalog-items";
const ARTISTS_PATH = "/api/dome-of-doom-artists";
const PAGE_SIZE = 100;

async function fetchAllCatalogItems() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      CATALOG_ITEMS_PATH,
      {
        "populate[derived][populate]": "*",
        "populate[overrides][populate]": "*",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

async function fetchAllArtists() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      ARTISTS_PATH,
      {
        "populate[derived][populate]": "*",
        "populate[overrides][populate]": "*",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

export async function fetchAndCacheStrapiData() {
  const [rawItems, rawArtists] = await Promise.all([fetchAllCatalogItems(), fetchAllArtists()]);

  const items = normalizeCatalogItems(rawItems);
  const artists = normalizeArtists(rawArtists);
  setCatalogItems(items);
  setArtists(artists);
  refreshCacheBustToken();

  logger.info(`[domeofdoomCache] cached ${items.length} catalog item(s), ${artists.length} artist(s)`);
  return { count: items.length, artistCount: artists.length };
}
