// server/apps/shadowform/registerSpa.js

import path from "path";
import express from "express";
import { projectRoot } from "#lib/paths.js";

export function registerShadowformSpa(app) {
  /* ── Preserved archived sites ── */
  app.use("/preserved", express.static(path.join(projectRoot, "public/preserved")));

  /* ── Shadowform SPA (catch-all) ── */
  app.use(express.static(path.join(projectRoot, "dist/shadowform")));
  app.use((req, res) => {
    res.sendFile(path.join(projectRoot, "dist/shadowform/index.html"));
  });
}
