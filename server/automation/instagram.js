// server/automation/instagram.js
//
// Instagram long-lived tokens last 60 days and can only be refreshed while
// still valid (and at least 24h old) — so we refresh well before expiry,
// daily, to never risk falling off the edge like the original tokens did.

import cron from "node-cron";
import { createLogger } from "#lib/logger.js";
const log = createLogger("instagram");
import { updateEnvVar } from "./env.js";
import { refreshLongLivedToken } from "./instagramApi.js";

const TOKEN_ENV_KEYS = ["INSTAGRAM_TOKEN_LOW_POLY", "INSTAGRAM_TOKEN_REDSPEAR"];

async function refreshInstagramTokens() {
  for (const envKey of TOKEN_ENV_KEYS) {
    const token = process.env[envKey];
    if (!token) {
      log.warn("refreshInstagramTokens", `${envKey} not set, skipping`);
      continue;
    }

    try {
      const { access_token } = await refreshLongLivedToken(token);
      updateEnvVar(envKey, access_token);
      log.info("refreshInstagramTokens", `refreshed ${envKey}`);
    } catch (err) {
      log.error("refreshInstagramTokens", `failed to refresh ${envKey}:`, err);
    }
  }
}

export function startInstagramCron() {
  cron.schedule("0 6 * * *", async () => {
    try {
      await refreshInstagramTokens();
    } catch (err) {
      log.error("startInstagramCron", "refresh run failed:", err);
    }
  });

  log.info("startInstagramCron", "job registered (daily at 6am)");
}
