// @vitest-environment node
import { request } from "node:http";
import { brotliDecompressSync, gunzipSync } from "node:zlib";
import { afterEach, expect, it, vi } from "vitest";
import { listen } from "./test/http.js";

const body = "<p>Dome of Doom releases and artists</p>".repeat(1000);
vi.mock("#routes/api.js", () => ({ registerApiRoutes: vi.fn() }));
vi.mock("#routes/ssr.js", () => ({
  registerSsrRoutes(app) {
    app.get("/probe", (req, res) => res.type("html").send(body));
    app.get("/probe.data", (req, res) => {
      res.type("text/x-script");
      res.write(body.slice(0, 100));
      res.end(body.slice(100));
    });
    app.get("/probe.js", (req, res) => res.type("js").send(body));
    app.get("/probe.png", (req, res) => res.type("png").send(Buffer.alloc(4096)));
  },
}));

let server;
afterEach(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  server = undefined;
});

async function read(path, encoding) {
  if (!server) {
    const { createApp } = await import("./app.js");
    server = await listen(createApp());
  }
  return new Promise((resolve, reject) => {
    const req = request({ hostname: "127.0.0.1", port: server.address().port, path,
      headers: { host: "domeofdoom.localhost", "accept-encoding": encoding } }, res => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("error", reject);
      res.on("end", () => resolve({ headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.end();
  });
}

it.each(["/probe", "/probe.data", "/probe.js"])("gzips %s with intact content and cache policy", async path => {
  const response = await read(path, "gzip");
  expect(response.headers["content-encoding"]).toBe("gzip");
  expect(response.headers.vary).toContain("Accept-Encoding");
  expect(gunzipSync(response.body).toString()).toBe(body);
  expect(response.body.length).toBeLessThan(Buffer.byteLength(body) / 10);
  if (path !== "/probe.js") expect(response.headers["cache-control"]).toBe("no-store");
});

it("negotiates Brotli for supporting clients", async () => {
  const response = await read("/probe", "br");
  expect(response.headers["content-encoding"]).toBe("br");
  expect(brotliDecompressSync(response.body).toString()).toBe(body);
});

it("preserves identity responses and skips binary images", async () => {
  const plain = await read("/probe", "identity");
  expect(plain.headers["content-encoding"]).toBeUndefined();
  expect(plain.body.toString()).toBe(body);
  const image = await read("/probe.png", "gzip");
  expect(image.headers["content-encoding"]).toBeUndefined();
  expect(image.body).toEqual(Buffer.alloc(4096));
});
