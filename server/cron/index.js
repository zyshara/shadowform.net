import { syncAllArtistStats } from "./syncStats.js";
import { startNotionCron } from "./notion.js";
import { startInstagramCron } from "./instagram.js";
import { logger } from "../lib/logger.js";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function runSyncAllArtistStats() {
  try {
    await syncAllArtistStats();
  } catch (err) {
    logger.error("[cron] syncStats failed:", err.message);
  }
}

export function startCronJobs() {
  // Disabled in dev — hits Spotify/Instagram/Bandsintown on every restart and
  // gets rate limited fast. Uncomment before deploying to prod.
  runSyncAllArtistStats();
  setInterval(runSyncAllArtistStats, ONE_DAY_MS);

  startNotionCron();
  startInstagramCron();

  logger.info("[cron] jobs registered");
}
