// server/dev.js
//
// Wires up livereload for the dev server — watches dist/ and refreshes the
// browser once webpack's watch build finishes. Only called in dev
// (NODE_ENV !== "production"), see server.js.

import path from "path";
import { fileURLToPath } from "url";
import { appsConfig, matchesAppHost } from "./lib/appsConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../");

export async function setupLiveReload(app) {
  const { default: livereload } = await import("livereload");
  const { default: connectLiveReload } = await import("connect-livereload");

  const liveReloadServer = livereload.createServer();
  liveReloadServer.watch(path.join(root, "dist"));
  const injectLiveReload = connectLiveReload();
  app.use((req, res, next) => {
    // SSR tenants use Vite's HMR client. connect-livereload buffers responses
    // and assumes binary chunks are Buffers, breaking React Router's
    // Uint8Array SSR stream (and preventing incremental delivery).
    if (Object.entries(appsConfig).some(([id, config]) => config.ssrFramework && matchesAppHost(id, req))) return next();
    return injectLiveReload(req, res, next);
  });
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => liveReloadServer.refresh("/"), 100);
  });
}
