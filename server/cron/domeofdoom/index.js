// server/cron/domeofdoom/index.js

import cron from "node-cron";
import { logger } from "../../lib/logger.js";

async function runDomeOfDoomSync() {
  console.log("hello world");
}

export function startDomeOfDoomCron() {
  cron.schedule(
    "0 0,12 * * *",
    async () => {
      try {
        await runDomeOfDoomSync();
      } catch (err) {
        logger.error("[domeofdoomCron] sync failed:", err.message);
      }
    },
    { timezone: "America/Los_Angeles" }
  );

  logger.info("[domeofdoomCron] job registered (daily at 12am and 12pm PST)");
}
