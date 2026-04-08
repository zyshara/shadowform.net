import cron from "node-cron";
import { syncAllArtistStats } from "./syncStats.js";
import { logger } from "../lib/logger.js";

// Run daily at 3am
cron.schedule("0 3 * * *", async () => {
  try {
    await syncAllArtistStats();
  } catch (err) {
    logger.error("[cron] syncStats failed:", err.message);
  }
});

logger.info("[cron] jobs registered");
