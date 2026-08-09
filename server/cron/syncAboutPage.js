// server/cron/syncAboutPage.js

import { strapiGet } from "../lib/strapi.js";
import { normalizeAboutPage } from "../models/aboutPage.js";
import { setAboutPage } from "../lib/bandcampCache.js";
import { logger } from "../lib/logger.js";

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
