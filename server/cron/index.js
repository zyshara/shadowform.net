// server/cron/index.js
//
// Top-level cron orchestrator — calls each app's/concern's own cron starter.
// Called once from server.js at boot.

import { startNotionCron } from "#automation/notion.js";
import { startInstagramCron } from "#automation/instagram.js";
import { startDomeOfDoomCron } from "#apps/domeofdoom/cron/index.js";
import { createLogger } from "#lib/logger.js";
const log = createLogger("cron");

let started = false;

export function startCronJobs() {
  if (started) return;
  started = true;
  startDomeOfDoomCron();
  startInstagramCron();
  startNotionCron();

  log.info("startCronJobs", "all jobs registered");
}
