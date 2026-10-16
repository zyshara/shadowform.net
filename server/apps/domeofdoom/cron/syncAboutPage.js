// server/apps/domeofdoom/cron/syncAboutPage.js
//
// Pulls the Dome of Doom About Page single-type from Strapi, normalizes it,
// and caches it in memory — server/apps/domeofdoom/registerSpa.js reads
// the cache to seed the client bundle on each request.

import { strapiGet } from "#lib/strapi.js";
import { normalizeAboutPage } from "#apps/domeofdoom/models/aboutPage.js";
import { setAboutPage } from "#apps/domeofdoom/bandcampCache.js";
import { logger } from "#lib/logger.js";

const ABOUT_PAGE_PATH = "/api/dome-of-doom-about-page";

export async function syncAboutPage() {
  logger.info("[syncAboutPage] starting sync...");

  try {
    const res = await strapiGet(ABOUT_PAGE_PATH, { populate: "*" }, { noCache: true });
    const aboutPage = normalizeAboutPage(res.data);

    setAboutPage(aboutPage);
    logger.info("[syncAboutPage] sync complete");
  } catch (err) {
    logger.error("[syncAboutPage] failed:", err.message);
    setAboutPage(null);
  }
}
