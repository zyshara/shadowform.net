import "dotenv/config";

import express from "express";
import { logger } from "#lib/logger.js";
import { startCronJobs } from "#cron/index.js";
import { setupLiveReload } from "./server/dev.js";
import { sslRedirect, noCacheHtml, stripTrailingSlash } from "#middleware/index.js";
import { canonicalHostRedirect } from "#lib/appsConfig.js";
import { registerApiRoutes } from "#routes/api.js";
import { registerSpaRoutes } from "#routes/spas.js";

const app = express();
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";

startCronJobs();

if (isDev) await setupLiveReload(app);

app.use(sslRedirect);
app.use(canonicalHostRedirect);
app.use(noCacheHtml);
app.use(stripTrailingSlash);
app.use(express.json());

registerApiRoutes(app);
registerSpaRoutes(app);

app.listen(port, () => {
  logger.info(`[server] listening on http://localhost:${port}`);
});
