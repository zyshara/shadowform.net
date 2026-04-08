import "dotenv/config";

import express from "express";
import { logger } from "./server/lib/logger.js";
import { syncAllArtistStats } from "./server/cron/syncStats.js";
import { setupLiveReload } from "./server/dev.js";
import { sslRedirect, noCacheHtml, stripTrailingSlash } from "./server/middleware/index.js";
import { registerApiRoutes } from "./server/routes/api.js";
import { registerSpaRoutes } from "./server/routes/spas.js";

const app = express();
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";

//syncAllArtistStats();

if (isDev) await setupLiveReload(app);

app.use(sslRedirect);
app.use(noCacheHtml);
app.use(stripTrailingSlash);

registerApiRoutes(app, express);
registerSpaRoutes(app);

app.listen(port, () => {
  logger.info(`[server] listening on http://localhost:${port}`);
});
