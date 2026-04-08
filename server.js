import "dotenv/config";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getArtists, getArtistBySlug, normalizeArtist } from "./server/api/artists.js";
import { syncAllArtistStats } from "./server/cron/syncStats.js";
import { registerGuestbookRoutes } from "./server/api/guestbook.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const isDev = process.env.NODE_ENV !== "production";

syncAllArtistStats();

registerGuestbookRoutes(app, express);

/* ───────────────────────────────────────────────
   Live reload in dev mode
─────────────────────────────────────────────── */
if (isDev) {
  const { default: livereload } = await import("livereload");
  const { default: connectLiveReload } = await import("connect-livereload");
  
  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(__dirname, "dist"));
  app.use(connectLiveReload());
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });
}

/* ───────────────────────────────────────────────
   SSL redirect (safe)
─────────────────────────────────────────────── */
app.use((req, res, next) => {
  const host = req.header("host") || "";
  const proto = req.header("x-forwarded-proto");

  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return next();
  }

  if (proto !== "https" || host === "www.shadowform.net") {
    return res.redirect(302, `https://shadowform.net${req.url}`);
  }

  next();
});

/* ───────────────────────────────────────────────
   No-cache for HTML
─────────────────────────────────────────────── */
app.use((req, res, next) => {
  if (req.path.match(/\.(js|css|png|jpg|svg|ico|map)$/)) {
    return next();
  }

  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use((req, res, next) => {
  // Do NOT touch swatchbook or management URLs
  if (req.originalUrl.startsWith("/creative/swatchbook")) return next();
  if (req.originalUrl.startsWith("/management")) return next();

  if (req.originalUrl.length > 1 && req.originalUrl.endsWith("/")) {
    return res.redirect(301, req.originalUrl.slice(0, -1));
  }

  next();
});

// Shared static assets (served at root)
app.use("/shared", express.static(path.join(__dirname, "public/shared")));

// ── Strapi proxy ─────────────────────────────────────────────────────────────
app.get("/api/artists/:slug", async (req, res) => {
  try {
    const data = await getArtistBySlug(req.params.slug);
    const artists = (data.data ?? []).map(normalizeArtist);
    if (!artists.length) return res.status(404).json({ error: "Artist not found" });
    res.json({ artist: artists[0] });
  } catch (err) {
    console.error("Strapi fetch failed:", err.message, err.body ?? "");
    res.status(502).json({ error: err.message });
  }
});

app.get("/api/artists", async (req, res) => {
  try {
    const data = await getArtists();
    const artists = (data.data ?? []).map(normalizeArtist);
    res.json({ artists });
  } catch (err) {
    console.error("Strapi fetch failed:", err.message, err.body ?? "");
    res.status(502).json({ error: err.message });
  }
});

app.get("/api/guestbook", async (req, res) => {
  res.json({ entries: [] });
});

/* ───────────────────────────────────────────────
   SWATCHBOOK SPA
─────────────────────────────────────────────── */

// Static assets
app.use(
  "/creative/swatchbook",
  express.static(path.join(__dirname, "dist/swatchbook")),
);

// SPA fallback (NO wildcards)
app.use("/creative/swatchbook", (req, res, next) => {
  if (req.path.includes(".")) return next();
  res.sendFile(path.join(__dirname, "dist/swatchbook/index.html"));
});

/* ───────────────────────────────────────────────
   MANAGEMENT SPA
─────────────────────────────────────────────── */

// Static assets
app.use(
  "/management",
  express.static(path.join(__dirname, "dist/management"), {
    index: false, // ← don't auto-serve index.html for directory requests
  }),
);

// SPA fallback (NO wildcards)
app.use("/management", (req, res, next) => {
  if (req.path === "/" || req.path === "") return next(); // ← let /management fall through
  if (req.path.includes(".")) return next();
  res.sendFile(path.join(__dirname, "dist/management/index.html"));
});

/* ───────────────────────────────────────────────
   MAIN APP
─────────────────────────────────────────────── */

// Static assets
app.use(express.static(path.join(__dirname, "dist/main")));

// SPA fallback (catch-all)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist/main/index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
