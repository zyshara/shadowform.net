import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../../");

export function registerSpaRoutes(app) {
  // Shared static assets (served at root)
  app.use("/shared", express.static(path.join(root, "public/shared")));

  /* ── Lowpoly SPA (subdomain) ── */
  const lowpolyStatic = express.static(path.join(root, "dist/lowpoly"));
  app.use((req, res, next) => {
    const host = req.header("host") || "";
    if (!host.split(":")[0].startsWith("lowpoly.")) return next();
    lowpolyStatic(req, res, () => {
      res.sendFile(path.join(root, "dist/lowpoly/index.html"));
    });
  });

  /* ── Swatchbook SPA ── */
  app.use("/creative/swatchbook", express.static(path.join(root, "dist/swatchbook")));
  app.use("/creative/swatchbook", (req, res, next) => {
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(root, "dist/swatchbook/index.html"));
  });

  /* ── Management SPA ── */
  app.use(
    "/management",
    express.static(path.join(root, "dist/management"), { index: false }),
  );
  app.use("/management", (req, res, next) => {
    if (req.path === "/" || req.path === "") return next();
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(root, "dist/management/index.html"));
  });

  /* ── Main SPA (catch-all) ── */
  app.use(express.static(path.join(root, "dist/main")));
  app.use((req, res) => {
    res.sendFile(path.join(root, "dist/main/index.html"));
  });
}
