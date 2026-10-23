import cron from "node-cron";
import { createLogger } from "#lib/logger.js";
const log = createLogger("domeofdoom");
import { scrapeBandcampAndSyncStrapi } from "./scrapeBandcampAndSyncStrapi.js";
import { backfillCatalogItems } from "./backfillCatalogItems.js";
import { backfillArtistSpotify } from "./backfillArtistSpotify.js";
import { syncAllArtistStats } from "#cron/artistStats.js";


async function runSafe(label, fn) {
  try {
    await fn();
  } catch (err) {
    log.error("runSafe", `${label} failed:`, err);
  }
}

export function startDomeOfDoomCron() {
  // ── Heavy scrape + backfill (twice daily) ────────────────────────────────
  cron.schedule(
    "0 0,12 * * *",
    async () => {
      await runSafe("bandcamp scrape + strapi sync", scrapeBandcampAndSyncStrapi);
      await runSafe("catalog item backfill", backfillCatalogItems);
      await runSafe("artist spotify backfill", backfillArtistSpotify);
      await runSafe("artist stats sync", syncAllArtistStats);
    },
    { timezone: "America/Los_Angeles", noOverlap: true }
  );

  log.info("startDomeOfDoomCron", "ingestion/backfill/stats jobs registered (twice daily)");
}
