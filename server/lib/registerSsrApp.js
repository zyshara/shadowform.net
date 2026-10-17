import path from "path";
import express from "express";
import { projectRoot } from "./paths.js";
import { getApp, matchesAppHost } from "./appsConfig.js";
import { createRequestHandler } from "react-router";
import { createRequest, sendResponse } from "@remix-run/node-fetch-server";

// Each tenant owns a Vite instance, SSR build, and HMR port.
export function registerSsrApp(app, appId, hmrPort) {
  const config = getApp(appId);
  const APP_ROOT = path.join(projectRoot, config.srcDir);
  const BUILD_DIR = path.join(projectRoot, config.distDir);
  const isDev = process.env.NODE_ENV !== "production";
  let viteDevServerPromise;
  function getViteDevServer() {
    return viteDevServerPromise ??= import("vite").then((vite) =>
      vite.createServer({
        root: APP_ROOT,
        server: { middlewareMode: true, hmr: { port: hmrPort } },
        appType: "custom",
      })
    );
  }
  if (isDev) {
    app.use(async (req, res, next) => {
      if (!matchesAppHost(appId, req)) return next();
      const viteDevServer = await getViteDevServer();
      viteDevServer.middlewares(req, res, async (err) => {
        if (err) return next(err);
        try {
          // Mirrors react-router's own internal dev-middleware (vite.js) —
          // Vite's Environment API `runner`, not the older `ssrLoadModule`,
          // and the request/response adapter react-router itself uses
          // (@remix-run/node-fetch-server), not @react-router/express's —
          // since that combination is what's actually tested against this
          // Vite/react-router version pairing.
          const build = await viteDevServer.environments.ssr.runner.import(
            "virtual:react-router/server-build"
          );
          const handler = createRequestHandler(build, "development");
          req.url = req.originalUrl;
          const webRequest = createRequest(req, res);
          const response = await handler(webRequest);
          await sendResponse(res, response);
        } catch (ssrErr) {
          viteDevServer.ssrFixStacktrace(ssrErr);
          next(ssrErr);
        }
      });
    });
    return;
  }

  const serveClientAssets = express.static(path.join(BUILD_DIR, "client"), {
    immutable: true,
    maxAge: "1y",
  });
  const buildPromise = import(path.join(BUILD_DIR, "server/index.js"));

  app.use((req, res, next) => {
    if (!matchesAppHost(appId, req)) return next();
    serveClientAssets(req, res, async (err) => {
      if (err) return next(err);
      try {
        const build = await buildPromise;
        const handler = createRequestHandler(build, "production");
        req.url = req.originalUrl;
        const webRequest = createRequest(req, res);
        const response = await handler(webRequest);
        await sendResponse(res, response);
      } catch (prodErr) {
        next(prodErr);
      }
    });
  });
}
