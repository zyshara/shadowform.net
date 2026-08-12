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
import { setArtistProfilePictures } from "../../lib/strapiArtistOverridesCache.js";
import { normalizeCatalogItems } from "../../models/catalogItem.js";
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

function resolveMediaUrl(media) {
  const url = media?.url;
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  const base = process.env.STRAPI_API_URL || "https://strapi-shadowform-52c53315c615.herokuapp.com";
  return `${base}${url}`;
}

// Only overrides.profile_picture is client-facing right now - no need to
// populate derived here, this cache exists purely to merge one field onto
// the Bandcamp-scraped roster (see spas.js).
async function fetchArtistProfilePictures() {
  const map = new Map();
  let page = 1;
  while (true) {
    const res = await strapiGet(
      ARTISTS_PATH,
      {
        "populate[overrides][populate]": "profile_picture",
        "fields[0]": "name",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    for (const entry of res.data) {
      const r = entry.attributes ?? entry;
      const name = r.name;
      const url = resolveMediaUrl(r.overrides?.profile_picture);
      if (name && url) map.set(name.trim().toUpperCase(), url);
    }
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return map;
}

export async function fetchAndCacheStrapiData() {
  const [raw, profilePictures] = await Promise.all([fetchAllCatalogItems(), fetchArtistProfilePictures()]);

  const items = normalizeCatalogItems(raw);
  setCatalogItems(items);
  setArtistProfilePictures(profilePictures);

  logger.info(
    `[domeofdoomCache] cached ${items.length} catalog item(s), ${profilePictures.size} artist profile picture override(s)`
  );
  return { count: items.length, profilePictureCount: profilePictures.size };
}
