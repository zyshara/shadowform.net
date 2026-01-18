import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

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
  // Do NOT touch swatchbook URLs
  if (req.originalUrl.startsWith("/creative/swatchbook")) {
    return next();
  }

  if (req.originalUrl.length > 1 && req.originalUrl.endsWith("/")) {
    return res.redirect(301, req.originalUrl.slice(0, -1));
  }

  next();
});

// Shared static assets (served at root)
app.use(
  "/shared",
  express.static(path.join(__dirname, "public/shared"))
);

/* ───────────────────────────────────────────────
   SWATCHBOOK (isolated SPA)
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
