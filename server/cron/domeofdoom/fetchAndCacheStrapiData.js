// server/cron/domeofdoom/fetchAndCacheStrapiData.js
//
// Pulls DomeofDoomCatalogItem from Strapi, normalizes it (override ??
// derived), and caches it in memory - same pattern as the old
// bandcampCache.js (getDiscography/getRoster/etc): server/routes/spas.js
// reads the cache to seed the domeofdoom client bundle on each request, so
// the browser never has to fetch Strapi directly. Runs on its own fast
// interval (every 5 min, see index.js) separate from the daily scrape/
// backfill jobs, since this is just re-reading what those already wrote.

import { strapiGet } from "../../lib/strapi.js";
import { setCatalogItems } from "../../lib/strapiCatalogCache.js";
import { normalizeCatalogItems } from "../../models/catalogItem.js";
import { logger } from "../../lib/logger.js";

const CATALOG_ITEMS_PATH = "/api/dome-of-doom-catalog-items";
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

export async function fetchAndCacheStrapiData() {
  const raw = await fetchAllCatalogItems();
  const items = normalizeCatalogItems(raw);
  setCatalogItems(items);
  logger.info(`[domeofdoomCache] cached ${items.length} catalog item(s)`);
  return { count: items.length };
}
