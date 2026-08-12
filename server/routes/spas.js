import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import express from "express";
import { loadMetadata, resolvePageMetadata } from "../lib/metadata.js";
import { getDiscography, getRoster, getMerch, getShows, getAboutPage } from "../lib/bandcampCache.js";
import { getCatalogItems } from "../lib/strapiCatalogCache.js";
import { getArtistProfilePictures } from "../lib/strapiArtistOverridesCache.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../../");

// Per-artist metadata (src/<artist>/metadata.json) for social link previews.
// Crawlers don't run JS, so per-page overrides (e.g. /epk) can't come from
// the CMS at request time via the client — they're injected server-side
// into the static HTML instead.
const redspearMetadata = loadMetadata(path.join(root, "src/redspear/metadata.json"));
const lowPolyMetadata  = loadMetadata(path.join(root, "src/low-poly/metadata.json"));

function escapeHtmlAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function injectPageMeta(html, metadata, pageKey) {
  const resolved = resolvePageMetadata(metadata, pageKey);

  const title       = escapeHtmlAttr(resolved.title);
  const description = escapeHtmlAttr(resolved.description);
  const url         = escapeHtmlAttr(resolved.url);
  const image       = escapeHtmlAttr(resolved.image);

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
}

function servePageHtml(distIndexPath, metadata, pageKey, res) {
  const html = readFileSync(distIndexPath, "utf8");
  res.type("html").send(injectPageMeta(html, metadata, pageKey));
}

// Seeds a JSON blob into the initial HTML so the client can read it on boot
// without a network round-trip — not React hydration (these are plain CSR
// SPAs, nothing is server-rendered), just pre-seeding data the server already
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

// A human-set DomeOfDoomArtist.overrides.profile_picture takes priority
// over the Bandcamp-scraped photo, matched by name (same matching key
// lib/artists.js uses to resolve artist relations elsewhere).
function withArtistProfilePictures(roster) {
  const overrides = getArtistProfilePictures();
  if (!overrides.size) return roster;
  return roster.map((artist) => {
    const override = overrides.get((artist.name ?? "").trim().toUpperCase());
    return override ? { ...artist, photo_src: override } : artist;
  });
}

export function registerSpaRoutes(app) {
  // Shared static assets (served at root)
  app.use("/shared", express.static(path.join(root, "public/shared")));

  /* ── Redspear SPA (subdomain) ── */
  const redspearIndex  = path.join(root, "dist/redspear/index.html");
  const redspearStatic = express.static(path.join(root, "dist/redspear"));
  app.use((req, res, next) => {
    const host = req.header("host") || "";
    if (!host.split(":")[0].startsWith("redspear.")) return next();
    if (req.path === "/epk") return servePageHtml(redspearIndex, redspearMetadata, "epk", res);
    redspearStatic(req, res, () => {
      res.sendFile(redspearIndex);
    });
  });

  /* ── Lowpoly SPA (subdomain) ── */
  const lowpolyIndex  = path.join(root, "dist/low-poly/index.html");
  const lowpolyStatic = express.static(path.join(root, "dist/low-poly"));
  app.use((req, res, next) => {
    const host = req.header("host") || "";
    if (!host.split(":")[0].startsWith("low-poly.")) return next();
    if (req.path === "/epk") return servePageHtml(lowpolyIndex, lowPolyMetadata, "epk", res);
    lowpolyStatic(req, res, () => {
      res.sendFile(lowpolyIndex);
    });
  });

  /* ── Dome of Doom SPA (subdomain) ── */
  const domeofdoomIndex  = path.join(root, "dist/domeofdoom/index.html");
  // index: false — otherwise express.static would serve "/" straight off
  // disk for a directory request, bypassing the discography seed below.
  const domeofdoomStatic = express.static(path.join(root, "dist/domeofdoom"), { index: false });
  app.use((req, res, next) => {
    const host = req.header("host") || "";
    if (!host.split(":")[0].startsWith("domeofdoom.")) return next();
    domeofdoomStatic(req, res, () => {
      let html = readFileSync(domeofdoomIndex, "utf8");
      html = injectJsonData(html, "discography-data", getDiscography());
      html = injectJsonData(html, "roster-data", withArtistProfilePictures(getRoster()));
      html = injectJsonData(html, "merch-data", getMerch());
      html = injectJsonData(html, "shows-data", getShows());
      html = injectJsonData(html, "about-page-data", getAboutPage());
      html = injectJsonData(html, "catalog-items-data", getCatalogItems());
      res.type("html").send(html);
    });
  });

  /* ── Swatchbook SPA ── */
  app.use("/creative/swatchbook", express.static(path.join(root, "dist/swatchbook")));
  app.use("/creative/swatchbook", (req, res, next) => {
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(root, "dist/swatchbook/index.html"));
  });

  /* ── Preserved archived sites ── */
  app.use("/preserved", express.static(path.join(root, "public/preserved")));

  /* ── Main SPA (catch-all) ── */
  app.use(express.static(path.join(root, "dist/main")));
  app.use((req, res) => {
    res.sendFile(path.join(root, "dist/main/index.html"));
  });
}
