// server/cron/domeofdoom/index.js

import cron from "node-cron";
import { logger } from "../../lib/logger.js";
import { scrapeBandcampAndSyncStrapi } from "./scrapeBandcampAndSyncStrapi.js";
import { backfillCatalogItems } from "./backfillCatalogItems.js";
import { backfillArtistSpotify } from "./backfillArtistSpotify.js";
import { fetchAndCacheStrapiData } from "./fetchAndCacheStrapiData.js";

export function startDomeOfDoomCron() {
  cron.schedule(
    "0 0,12 * * *",
    async () => {
      try {
        await scrapeBandcampAndSyncStrapi();
        await backfillCatalogItems();
        await backfillArtistSpotify();
      } catch (err) {
        logger.error("[domeofdoomCron] sync failed:", err.message);
      }
    },
    { timezone: "America/Los_Angeles" }
  );

  // Re-reads what the job above already wrote to Strapi - runs immediately
  // on startup (so the cache isn't empty until the first 5-minute tick),
  // then every 5 minutes after.
  fetchAndCacheStrapiData().catch((err) =>
    logger.error("[domeofdoomCron] initial catalog cache fetch failed:", err.message)
  );
  cron.schedule("*/5 * * * *", async () => {
    try {
      await fetchAndCacheStrapiData();
    } catch (err) {
      logger.error("[domeofdoomCron] catalog cache fetch failed:", err.message);
    }
  });

  logger.info("[domeofdoomCron] job registered (daily at 12am and 12pm PST; catalog cache every 5 min)");
}
