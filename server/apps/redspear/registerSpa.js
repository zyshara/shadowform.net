// server/apps/redspear/registerSpa.js

import path from "path";
import express from "express";
import { projectRoot } from "#lib/paths.js";
import { getApp, matchesAppHost } from "#lib/appsConfig.js";
import { servePageHtml } from "#lib/metadata.js";

const metadata = getApp("redspear").metadata;

export function registerRedspearSpa(app) {
  const index  = path.join(projectRoot, "dist/redspear/index.html");
  const static_ = express.static(path.join(projectRoot, "dist/redspear"));

  app.use((req, res, next) => {
    if (!matchesAppHost("redspear", req)) return next();
    if (req.path === "/epk") return servePageHtml(index, metadata, "epk", res);
    static_(req, res, () => {
      res.sendFile(index);
    });
  });
}
