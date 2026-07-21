// server/cron/instagram.js
//
// Instagram long-lived tokens last 60 days and can only be refreshed while
// still valid (and at least 24h old) — so we refresh well before expiry,
// daily, to never risk falling off the edge like the original tokens did.

import cron from "node-cron";
import { logger } from "../lib/logger.js";
import { updateEnvVar } from "../lib/env.js";
import { refreshLongLivedToken } from "../lib/instagram.js";

const TOKEN_ENV_KEYS = ["INSTAGRAM_TOKEN_LOW_POLY", "INSTAGRAM_TOKEN_REDSPEAR"];

async function refreshInstagramTokens() {
  for (const envKey of TOKEN_ENV_KEYS) {
    const token = process.env[envKey];
    if (!token) {
      logger.warn(`[instagramCron] ${envKey} not set, skipping`);
      continue;
    }

    try {
      const { access_token } = await refreshLongLivedToken(token);
      updateEnvVar(envKey, access_token);
      logger.info(`[instagramCron] refreshed ${envKey}`);
    } catch (err) {
      logger.error(`[instagramCron] failed to refresh ${envKey}:`, err.message);
    }
  }
}

export function startInstagramCron() {
  cron.schedule("0 6 * * *", async () => {
    try {
      await refreshInstagramTokens();
    } catch (err) {
      logger.error("[instagramCron] refresh run failed:", err.message);
    }
  });

  logger.info("[instagramCron] job registered (daily at 6am)");
}
