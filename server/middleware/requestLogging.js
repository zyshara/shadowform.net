import { appsConfig, matchesAppHost } from "#lib/appsConfig.js";
import { createLogger } from "#lib/logger.js";

const tenants = Object.keys(appsConfig).map(id => ({ id, log: createLogger(id) }));
const fallback = createLogger("server");

export function requestLogging(req, res, next) {
  const log = tenants.find(({ id }) => matchesAppHost(id, req))?.log ?? fallback;
  const pathname = req.path;
  const method = req.method;
  const started = performance.now();
  let finished = false;
  res.once("finish", () => {
    finished = true;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn"
      : pathname.startsWith("/assets/") || pathname.startsWith("/shared/") ? "debug" : "info";
    log[level](method, pathname, { status: res.statusCode, durationMs: Math.round(performance.now() - started) });
  });
  res.once("close", () => {
    if (!finished) log.warn(method, pathname, { event: "connection closed before response completed",
      durationMs: Math.round(performance.now() - started) });
  });
  next();
}
