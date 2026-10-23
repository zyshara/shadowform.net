// server/routes/ssr.js
//
// Top-level frontend-route orchestrator — mounts shared static assets, then each
// tenant's SSR frontend (Shadowform also mounts preserved archived sites).
// Called once from server.js at boot.

import path from "path";
import express from "express";
import { projectRoot } from "#lib/paths.js";
import { registerRedspearSsr } from "#apps/redspear/registerSsr.js";
import { registerLowPolySsr } from "#apps/low-poly/registerSsr.js";
import { registerDomeOfDoomSsr } from "#apps/domeofdoom/registerSsr.js";
import { registerShadowformSsr } from "#apps/shadowform/registerSsr.js";

export function registerSsrRoutes(app) {
  // Shared static assets (served at root)
  app.use("/shared", express.static(path.join(projectRoot, "public/shared")));

  registerRedspearSsr(app);
  registerLowPolySsr(app);
  registerDomeOfDoomSsr(app);
  registerShadowformSsr(app);
}
