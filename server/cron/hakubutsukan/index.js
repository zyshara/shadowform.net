// server/cron/hakubutsukan/index.js

import cron from "node-cron";
import { logger } from "../../lib/logger.js";
import { fetchAndCacheHakubutsukanData } from "./fetchAndCacheHakubutsukanData.js";

export function startHakubutsukanCron() {
  // Initial warm-up so the cache isn't empty until the first cron tick
  fetchAndCacheHakubutsukanData().catch((err) =>
    logger.error("[hakubutsukanCron] initial cache fetch failed:", err.message)
  );

  // Re-cache every 30 minutes — exhibit dates change infrequently, no need
  // for the 5-minute cadence of the catalog cache
  cron.schedule("*/30 * * * *", async () => {
    try {
      await fetchAndCacheHakubutsukanData();
    } catch (err) {
      logger.error("[hakubutsukanCron] cache refresh failed:", err.message);
    }
  });

  logger.info("[hakubutsukanCron] job registered (every 30 min)");
}
