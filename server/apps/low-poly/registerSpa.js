// server/apps/low-poly/registerSpa.js

import path from "path";
import express from "express";
import { projectRoot } from "#lib/paths.js";
import { getApp, matchesAppHost } from "#lib/appsConfig.js";
import { servePageHtml } from "#lib/metadata.js";

const metadata = getApp("low-poly").metadata;

export function registerLowPolySpa(app) {
  const index  = path.join(projectRoot, "dist/low-poly/index.html");
  const static_ = express.static(path.join(projectRoot, "dist/low-poly"));

  app.use((req, res, next) => {
    if (!matchesAppHost("low-poly", req)) return next();
    if (req.path === "/epk") return servePageHtml(index, metadata, "epk", res);
    static_(req, res, () => {
      res.sendFile(index);
    });
  });
}
