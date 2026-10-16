// server/apps/domeofdoom/registerSpa.js

import path from "path";
import { readFileSync } from "fs";
import express from "express";
import { projectRoot } from "#lib/paths.js";
import { matchesAppHost } from "#lib/appsConfig.js";
import { getMerch, getShows, getAboutPage } from "./bandcampCache.js";
import { getCatalogItems } from "./strapiCatalogCache.js";
import { getArtists } from "./strapiArtistCache.js";
import { withCacheBust } from "./cacheBustToken.js";

// Seeds a JSON blob into the initial HTML so the client can read it on boot
// without a network round-trip — not React hydration (this is a plain CSR
// SPA, nothing is server-rendered), just pre-seeding data the server already
// has. Escaping "<" prevents a literal "</script>" in the data from closing
// the tag early; JSON strings support \uXXXX escapes, so this is safe to
// JSON.parse on the other end.
function injectJsonData(html, elementId, data) {
  const json = JSON.stringify(data ?? null)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  const script = `<script type="application/json" id="${elementId}">${json}</script>`;
  return html.replace("</head>", `${script}</head>`);
}

// Busts the browser's image cache with a `?v=<token>` that only changes
// when fetchAndCacheStrapiData() pulls fresh data (see cacheBustToken.js) -
// not on every request, so a page reload doesn't force every artist photo
// to re-download.
function withCacheBustedPhotos(roster) {
  return roster.map((artist) =>
    artist.photo_src ? { ...artist, photo_src: withCacheBust(artist.photo_src) } : artist
  );
}

export function registerDomeOfDoomSpa(app) {
  const index  = path.join(projectRoot, "dist/domeofdoom/index.html");
  // index: false — otherwise express.static would serve "/" straight off
  // disk for a directory request, bypassing the data seed below.
  const static_ = express.static(path.join(projectRoot, "dist/domeofdoom"), { index: false });

  app.use((req, res, next) => {
    if (!matchesAppHost("domeofdoom", req)) return next();
    static_(req, res, () => {
      let html = readFileSync(index, "utf8");
      html = injectJsonData(html, "roster-data", withCacheBustedPhotos(getArtists()));
      html = injectJsonData(html, "merch-data", getMerch());
      html = injectJsonData(html, "shows-data", getShows());
      html = injectJsonData(html, "about-page-data", getAboutPage());
      html = injectJsonData(html, "catalog-items-data", getCatalogItems());
      res.type("html").send(html);
    });
  });
}
