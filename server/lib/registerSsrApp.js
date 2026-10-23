import { createLogger } from "./logger.js";
import path from "path";
import express from "express";
import { projectRoot } from "./paths.js";
import { getApp, matchesAppHost } from "./appsConfig.js";
import { RouterContextProvider, createRequestHandler } from "react-router";
import { createRequest, sendResponse } from "@remix-run/node-fetch-server";

// Each tenant owns a Vite instance, SSR build, and HMR port.
export function registerSsrApp(app, appId, { services, preserved = false } = {}) {
  const log = createLogger(appId);
  const config = getApp(appId);
  const APP_ROOT = path.join(projectRoot, config.srcDir);
  const BUILD_DIR = path.join(projectRoot, config.distDir);
  const isDev = process.env.NODE_ENV !== "production";
  function getLoadContext(build) {
    const context = new RouterContextProvider();
    if (services) context.set(build.routes.root.module.servicesContext, services);
    return context;
  }
  if (preserved) {
    const servePreserved = express.static(path.join(projectRoot, "public/preserved"));
    app.use("/preserved", (req, res, next) => {
      if (!matchesAppHost(appId, req)) return next();
      servePreserved(req, res, next);
    });
  }
  let viteDevServerPromise;
  function getViteDevServer() {
    return viteDevServerPromise ??= import("vite").then(async (vite) => {
      log.info("getViteDevServer", "starting Vite", { hmrPort: config.hmrPort });
      const server = await vite.createServer({
        root: APP_ROOT,
        server: { middlewareMode: true, hmr: { port: config.hmrPort } },
        appType: "custom",
      });
      log.info("getViteDevServer", "Vite ready");
      return server;
    });
  }
  if (isDev) {
    app.use(async (req, res, next) => {
      if (!matchesAppHost(appId, req)) return next();
      const viteDevServer = await getViteDevServer();
      viteDevServer.middlewares(req, res, async (err) => {
        if (err) return next(err);
        try {
          // Use React Router's Environment API runner and Node fetch adapter.
          const build = await viteDevServer.environments.ssr.runner.import(
            "virtual:react-router/server-build"
          );
          const handler = createRequestHandler(build, "development");
          req.url = req.originalUrl;
          const webRequest = createRequest(req, res);
          const response = await handler(webRequest, getLoadContext(build));
          await sendResponse(res, response);
        } catch (ssrErr) {
          log.error("renderSsr", "development render failed", ssrErr);
          if (ssrErr instanceof Error) viteDevServer.ssrFixStacktrace(ssrErr);
          next(ssrErr);
        }
      });
    });
    return;
  }

  const serveClientAssets = express.static(path.join(BUILD_DIR, "client"), {
    maxAge: "5m",
    setHeaders(res, file) {
      const assetsDir = path.join(BUILD_DIR, "client/assets") + path.sep;
      res.setHeader("Cache-Control", file.startsWith(assetsDir)
        ? "public, max-age=31536000, immutable" : "public, max-age=300");
    },
  });
  let handlerPromise;

  app.use((req, res, next) => {
    if (!matchesAppHost(appId, req)) return next();
    serveClientAssets(req, res, async (err) => {
      if (err) return next(err);
      try {
        const { build, handler } = await (handlerPromise ??= import(path.join(BUILD_DIR, "server/index.js"))
          .then(build => ({ build, handler: createRequestHandler(build, "production") })));
        req.url = req.originalUrl;
        const webRequest = createRequest(req, res);
        const response = await handler(webRequest, getLoadContext(build));
        await sendResponse(res, response);
      } catch (prodErr) {
        log.error("renderSsr", "production render failed", prodErr);
        next(prodErr);
      }
    });
  });
}
