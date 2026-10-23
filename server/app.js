import { requestLogging } from "#middleware/requestLogging.js";
import express from "express";
import { sslRedirect, noCacheHtml, stripTrailingSlash } from "#middleware/index.js";
import { canonicalHostRedirect } from "#lib/appsConfig.js";
import { registerApiRoutes } from "#routes/api.js";
import { registerSsrRoutes } from "#routes/ssr.js";

// Building the app never starts a listener or schedules background work.
export function createApp() {
  const app = express();
  // Heroku appends the router-observed client address to X-Forwarded-For.
  // Trust only the direct router hop, never caller-supplied addresses before it.
  const proxy = process.env.TRUST_PROXY ??
    (process.env.NODE_ENV === "production" && process.env.DYNO ? "1" : "false");
  if (proxy) app.set("trust proxy", proxy === "false" ? false
    : proxy === "true" ? true : /^\d+$/.test(proxy) ? Number(proxy) : proxy);
  app.use(requestLogging);
  app.use(sslRedirect);
  app.use(canonicalHostRedirect);
  app.use(noCacheHtml);
  app.use(stripTrailingSlash);
  registerApiRoutes(app);
  registerSsrRoutes(app);
  return app;
}
