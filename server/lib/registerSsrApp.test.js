// @vitest-environment node
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import express from "express";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { listen, get } from "../test/http.js";

const root = vi.hoisted(() => `/tmp/shadowform-ssr-test-${process.pid}-${Date.now()}`);
vi.mock("#lib/paths.js", () => ({ projectRoot: root }));
vi.mock("./paths.js", () => ({ projectRoot: root }));
vi.mock("./appsConfig.js", () => ({
  getApp: () => ({ srcDir: "src/shadowform", distDir: "dist/shadowform", hmrPort: 24681 }),
  matchesAppHost: (_id, req) => req.headers.host === "shadowform.localhost",
}));
let server;
beforeAll(async () => {
  vi.stubEnv("NODE_ENV", "production");
  await mkdir(`${root}/public/preserved/example`, { recursive: true });
  await mkdir(`${root}/dist/shadowform/client/assets`, { recursive: true });
  await writeFile(`${root}/public/preserved/example/index.html`, "Archived site");
  await writeFile(`${root}/dist/shadowform/client/assets/main-abc123.js`, "// test");
  await writeFile(`${root}/dist/shadowform/client/sitemap.xml`, "<urlset />");
  const { registerSsrApp } = await import("./registerSsrApp.js");
  const app = express();
  app.use((_req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });
  registerSsrApp(app, "shadowform", { preserved: true });
  app.use((_req, res) => res.sendStatus(404));
  server = await listen(app);
});
afterAll(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(root, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

it("serves archived sites only on the owning tenant", async () => {
  expect(await (await get(server, "/preserved/example/index.html")).text()).toBe("Archived site");
  expect((await get(server, "/preserved/example/index.html", "redspear.localhost")).status).toBe(404);
});
it("overrides HTML no-store for hashed assets but limits sitemap caching", async () => {
  const asset = await get(server, "/assets/main-abc123.js");
  expect(asset.status).toBe(200);
  expect(asset.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
  const sitemap = await get(server, "/sitemap.xml");
  expect(sitemap.status).toBe(200);
  expect(sitemap.headers.get("cache-control")).toBe("public, max-age=300");
});
