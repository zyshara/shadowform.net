// server/routes/spas.js
//
// Top-level SPA-route orchestrator — mounts shared static assets, then each
// app's own SPA-serving route (shadowform's includes the archived-sites
// mount and the catch-all, since nothing else needs to claim "everything
// unmatched"). Called once from server.js at boot.

import path from "path";
import express from "express";
import { projectRoot } from "#lib/paths.js";
import { registerRedspearSpa } from "#apps/redspear/registerSpa.js";
import { registerLowPolySpa } from "#apps/low-poly/registerSpa.js";
import { registerDomeOfDoomSpa } from "#apps/domeofdoom/registerSpa.js";
import { registerShadowformSpa } from "#apps/shadowform/registerSpa.js";

export function registerSpaRoutes(app) {
  // Shared static assets (served at root)
  app.use("/shared", express.static(path.join(projectRoot, "public/shared")));

  registerRedspearSpa(app);
  registerLowPolySpa(app);
  registerDomeOfDoomSpa(app);
  registerShadowformSpa(app);
}
