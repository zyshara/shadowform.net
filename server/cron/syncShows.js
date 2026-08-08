// server/cron/syncShows.js
//
// Shows come from Strapi, but the artists relation there only ever stores a
// `name` (auto-created by the discography sync — see lib/artists.js). Artist
// photos live in the Bandcamp-scraped roster cache instead, so after fetching
// shows we match each show artist's name against the roster to attach a pfp.

import { strapiGet } from "../lib/strapi.js";
import { normalizeShows } from "../models/show.js";
import { setShows, getRoster } from "../lib/bandcampCache.js";
import { logger } from "../lib/logger.js";

const SHOWS_PATH = "/api/dome-of-doom-shows";
const PAGE_SIZE = 100;

async function fetchAllShowEntries(params = {}) {
  const all = [];
  let page = 1;

  while (true) {
    const res = await strapiGet(
      SHOWS_PATH,
      {
        ...params,
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
        "populate[artists][fields][0]": "name",
        "sort[0]": "date:desc",
      },
      { noCache: true }
    );

    all.push(...res.data);

    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }

  return all;
}

function buildPfpLookup() {
  const map = new Map();
  for (const artist of getRoster()) {
    if (artist?.name && artist?.photo_src) {
      map.set(artist.name.trim().toUpperCase(), artist.photo_src);
    }
  }
  return map;
}

export async function syncShows() {
  logger.info("[syncShows] starting sync...");

  try {
    const allEntries = await fetchAllShowEntries();
    const pfpByName = buildPfpLookup();
    const shows = normalizeShows(allEntries, pfpByName);

    setShows(shows);
    logger.info(`[syncShows] sync complete, ${shows.length} shows in cache`);
  } catch (err) {
    logger.error("[syncShows] failed:", err.message);
    // Return empty array so the app doesn't break if Strapi is down
    setShows([]);
  }
}
