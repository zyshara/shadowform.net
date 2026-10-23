// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { listen, get } from "./test/http.js";
import { rateLimit } from "#lib/rateLimit.js";

vi.mock("#routes/ssr.js", () => ({ registerSsrRoutes: vi.fn() }));
const cron = vi.hoisted(() => vi.fn());
vi.mock("#cron/index.js", () => ({ startCronJobs: cron }));
vi.mock("#routes/api.js", () => ({
  registerApiRoutes(app) {
    app.get("/api/probe", rateLimit({ windowMs: 60000, max: 1 }), (req, res) => res.json({ ip: req.ip }));
  },
}));
let server;
afterEach(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  server = undefined;
  vi.unstubAllEnvs();
});
async function start() {
  vi.stubEnv("NODE_ENV", "production");
  const { createApp } = await import("./app.js");
  const app = createApp();
  server = await listen(app);
  return (...args) => get(server, ...args);
}

it("creates apps without starting cron and ignores spoofed forwarding headers by default", async () => {
  vi.stubEnv("TRUST_PROXY", "");
  const get = await start();
  const response = await get("/api/probe", undefined, { "x-forwarded-for": "198.51.100.1" });
  expect((await response.json()).ip).toBe("127.0.0.1");
  const limited = await get("/api/probe", undefined, { "x-forwarded-for": "198.51.100.2" });
  expect(limited.status).toBe(429);
  expect(limited.headers.get("retry-after")).toBeTruthy();
  expect(cron).not.toHaveBeenCalled();
});

it("uses explicitly trusted proxy configuration consistently", async () => {
  vi.stubEnv("TRUST_PROXY", "loopback");
  const get = await start();
  expect((await (await get("/api/probe", undefined, { "x-forwarded-for": "198.51.100.1" })).json()).ip).toBe("198.51.100.1");
  expect((await get("/api/probe", undefined, { "x-forwarded-for": "198.51.100.2" })).status).toBe(200);
});

it("uses Heroku's appended client address and ignores spoofed addresses before it", async () => {
  vi.stubEnv("TRUST_PROXY", undefined);
  vi.stubEnv("DYNO", "web.1");
  const get = await start();
  const first = await get("/api/probe", undefined, { "x-forwarded-for": "203.0.113.99, 198.51.100.1" });
  expect((await first.json()).ip).toBe("198.51.100.1");
  expect((await get("/api/probe", undefined, { "x-forwarded-for": "203.0.113.88, 198.51.100.1" })).status).toBe(429);
  expect((await get("/api/probe", undefined, { "x-forwarded-for": "203.0.113.99, 198.51.100.2" })).status).toBe(200);
});

it("keeps development untrusted and honors an explicit Heroku override", async () => {
  const { createApp } = await import("./app.js");
  vi.stubEnv("DYNO", "web.1");
  vi.stubEnv("TRUST_PROXY", undefined);
  vi.stubEnv("NODE_ENV", "development");
  expect(createApp().get("trust proxy")).toBe(false);
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("TRUST_PROXY", "false");
  expect(createApp().get("trust proxy")).toBe(false);
});
