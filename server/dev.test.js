// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import express from "express";
import { request } from "node:http";
import { setupLiveReload } from "./dev.js";

vi.mock("livereload", () => ({
  default: {
    createServer: () => ({ watch() {}, server: { once() {} } }),
  },
}));

let server;
afterEach(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

it("passes SSR byte streams through on SSR tenant routes and keeps webpack LiveReload", async () => {
  const app = express();
  await setupLiveReload(app);
  app.use((req, res) => {
    res.type("html");
    const html = "<!DOCTYPE html><html><body>Red Spear — 音楽</body></html>";
    const bytes = new TextEncoder().encode(html);
    if (/^(redspear|low-poly)\./.test(req.hostname)) {
      // Split inside a multibyte character to catch accidental chunk decoding.
      const split = bytes.indexOf(0xe2) + 1;
      res.write(bytes.subarray(0, split));
      res.end(bytes.subarray(split));
    } else {
      res.end(html);
    }
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const get = (route, host) => new Promise((resolve, reject) => {
    const req = request(origin + route, {
      headers: { Host: host, Accept: "text/html" },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, text: Buffer.concat(chunks).toString() }));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.end();
  });
  for (const host of ["redspear.localhost:3000", "low-poly.localhost:3000"]) {
    for (const route of ["/", "/epk"]) {
      const response = await get(route, host);
      expect(response.status).toBe(200);
      expect(response.text).toBe("<!DOCTYPE html><html><body>Red Spear — 音楽</body></html>");
    }
  }
  const legacy = await get("/", "shadowform.localhost:3000");
  expect(legacy.text).toContain(":35729/livereload.js");
});
