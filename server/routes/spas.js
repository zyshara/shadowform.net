import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../../");

// Per-artist EPK meta (title/description/image/url) for social link previews.
// Crawlers don't run JS, so this can't come from the CMS at request time via
// the client — it's injected server-side into the static HTML instead.
const epkMeta = JSON.parse(readFileSync(path.join(root, "server/data/epk-meta.json"), "utf8"));

function escapeHtmlAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function injectEpkMeta(html, slug) {
  const meta = epkMeta[slug];
  if (!meta) return html;

  const title       = escapeHtmlAttr(meta.title);
  const description = escapeHtmlAttr(meta.description);
  const url         = escapeHtmlAttr(meta.url);
  const image       = escapeHtmlAttr(meta.image);

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

function serveEpkHtml(distIndexPath, slug, res) {
  const html = readFileSync(distIndexPath, "utf8");
  res.type("html").send(injectEpkMeta(html, slug));
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
    if (req.path === "/epk") return serveEpkHtml(redspearIndex, "redspear", res);
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
    if (req.path === "/epk") return serveEpkHtml(lowpolyIndex, "low-poly", res);
    lowpolyStatic(req, res, () => {
      res.sendFile(lowpolyIndex);
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
