// server/routes/api.js
//
// Top-level API-route orchestrator — registers every app's own API routes
// onto the Express app, each scoped to its own hostnames via
// requireAppHost. Called once from server.js at boot.
//
// Auth (server/auth/index.js) is intentionally not wired up here right
// now — not in active use, pending a re-evaluation of the whole auth
// design, not deleted.

import express from "express";
import { registerShadowformApi } from "#apps/shadowform/registerApi.js";
import { registerDomeOfDoomApi } from "#apps/domeofdoom/registerApi.js";
import { registerRedspearApi } from "#apps/redspear/registerApi.js";
import { registerLowPolyApi } from "#apps/low-poly/registerApi.js";
import { requireAppHost } from "#lib/appsConfig.js";

function mount(app, appId, register) {
  const router = express.Router();
  router.use(requireAppHost(appId));
  register(router, express);
  app.use(router);
}

export function registerApiRoutes(app) {
  mount(app, "shadowform", registerShadowformApi);
  mount(app, "domeofdoom", registerDomeOfDoomApi);
  mount(app, "redspear", registerRedspearApi);
  mount(app, "low-poly", registerLowPolyApi);
}
