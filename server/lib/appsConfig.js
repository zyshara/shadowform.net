// server/lib/appsConfig.js
//
// Single source of truth for every app's hostnames, canonical domain, build
// paths, and SEO metadata — read once from config/apps.json. Consumed by
// webpack.config.js (build time) and by the pieces below (request time):
// spas.js's host-sniffing, each app's own SPA route, the API host-guard,
// and the canonical-host redirect.

import { readFileSync } from "fs";
import path from "path";
import { projectRoot } from "./paths.js";

export const appsConfig = JSON.parse(
  readFileSync(path.join(projectRoot, "config/apps.json"), "utf8")
);

export function getApp(appId) {
  const app = appsConfig[appId];
  if (!app) throw new Error(`appsConfig: unknown app "${appId}"`);
  return app;
}

// *.localhost (and bare localhost/127.0.0.1) never get redirected — used
// only by canonicalHostRedirect below. Each app's own hostnames list
// already carries its own "<app>.localhost" entry for local subdomain
// testing, so host *matching* (matchesAppHost/requireAppHost) never needs
// this bypass — if it did, bare "localhost" would match every app at once
// and whichever is checked first would swallow every local request.
export function isLocalDevHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost");
}

function hostnameOf(req) {
  return (req.header("host") || "").split(":")[0];
}

// True if `req`'s Host header is one of `appId`'s own hostnames. Used by
// each app's own SPA-serving route.
export function matchesAppHost(appId, req) {
  return getApp(appId).hostnames?.includes(hostnameOf(req)) ?? false;
}

// Express middleware: only hands the request to `appId`'s own routes if its
// Host header is one of that app's hostnames. On a match, continues into
// this app's own routes as normal (`next()`). On a mismatch, calls
// `next('router')` — which skips the *rest of this router* entirely and
// returns control to whatever mounted it, so the *next* app's router (or
// the eventual SPA catch-all) gets a chance, rather than this app
// incorrectly claiming "not found" for a request that was never its own.
// Used to scope an app's API routes to its own subdomain(s) now that the
// URL path no longer carries the app name — see server/routes/api.js.
export function requireAppHost(appId) {
  const { hostnames = [] } = getApp(appId);
  return function (req, res, next) {
    if (hostnames.includes(hostnameOf(req))) return next();
    next("router");
  };
}

// Express middleware: 301s any app's non-canonical hostname (e.g.
// domeofdoom.shadowform.net, or a bare domeofdoom.org when www is
// canonical) to that app's canonicalHost. A no-op for apps with only one
// hostname, since it's already canonical.
export function canonicalHostRedirect(req, res, next) {
  const hostname = hostnameOf(req);
  if (isLocalDevHost(hostname)) return next();

  for (const { hostnames = [], canonicalHost } of Object.values(appsConfig)) {
    if (hostnames.includes(hostname) && hostname !== canonicalHost) {
      return res.redirect(301, `https://${canonicalHost}${req.originalUrl}`);
    }
  }

  next();
}
