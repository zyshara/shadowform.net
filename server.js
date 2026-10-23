import "dotenv/config";
import { createApp } from "./server/app.js";
import { createLogger } from "#lib/logger.js";
const log = createLogger("server");

const app = createApp();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  log.info("startServer", `listening on http://localhost:${port}`);
  // Preserve production scheduling, but keep normal local development read-only.
  const enabled = process.env.CRON_ENABLED === undefined
    ? process.env.NODE_ENV === "production" : process.env.CRON_ENABLED === "true";
  if (enabled) {
    import("#cron/index.js").then(({ startCronJobs }) => startCronJobs()).catch(err => {
      log.error("startServer", "cron startup failed:", err);
    });
  } else log.info("startServer", "cron disabled (set CRON_ENABLED=true to enable)");
});
