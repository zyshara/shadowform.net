import { startNotionCron } from "./notion.js";
import { startInstagramCron } from "./instagram.js";
import { startDomeOfDoomCron } from "./domeofdoom/index.js";
import { startHakubutsukanCron } from "./hakubutsukan/index.js";
import { logger } from "../lib/logger.js";

export function startCronJobs() {
  startDomeOfDoomCron();
  startHakubutsukanCron();
  startInstagramCron();
  startNotionCron();

  logger.info("[cron] all jobs registered");
}
