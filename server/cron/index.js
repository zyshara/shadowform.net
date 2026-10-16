// server/cron/index.js
//
// Top-level cron orchestrator — calls each app's/concern's own cron starter.
// Called once from server.js at boot.

import { startNotionCron } from "#automation/notion.js";
import { startInstagramCron } from "#automation/instagram.js";
import { startDomeOfDoomCron } from "#apps/domeofdoom/cron/index.js";
import { logger } from "#lib/logger.js";

export function startCronJobs() {
  startDomeOfDoomCron();
  startInstagramCron();
  startNotionCron();

  logger.info("[cron] all jobs registered");
}
