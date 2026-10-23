// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import express from "express";
import { request } from "node:http";
import { deflateSync } from "node:zlib";
import { randomBytes } from "node:crypto";

vi.mock("#lib/strapi.js", () => ({
  strapiGet: vi.fn(), strapiPost: vi.fn(), strapiPut: vi.fn(),
  strapiUploadMedia: vi.fn(), invalidateCache: vi.fn(),
  resolveMediaUrl: (media) => media?.url ?? null,
}));

let server, strapi;
beforeEach(async () => {
  vi.resetModules();
  strapi = await import("#lib/strapi.js");
  strapi.strapiGet.mockImplementation(async (url) => ({ data: url === "/api/guestbook"
    ? { allowed_guestbook_tags: [] }
    : { id: 10, name: "Test", date_posted: "2026-10-17T00:00:00Z", drawing: { url: "https://example.com/drawing.png" } } }));
  strapi.strapiUploadMedia.mockResolvedValue({ id: 42 });
  strapi.strapiPost.mockResolvedValue({ data: { id: 10, documentId: "test-entry" } });
  strapi.strapiPut.mockResolvedValue({});
  const { registerGuestbookRoutes } = await import("./routes/guestbook.js");
  const app = express();
  registerGuestbookRoutes(app);
  server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
});
afterEach(async () => {
  await new Promise(resolve => server.close(resolve));
  vi.resetAllMocks();
});

const post = (body) => new Promise((resolve, reject) => {
  const req = request({ hostname: "127.0.0.1", port: server.address().port,
    path: "/api/guestbook", method: "POST",
    headers: { host: "shadowform.localhost:3000", "content-type": "application/json" },
  }, res => {
    const chunks = [];
    res.on("data", c => chunks.push(c));
    res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(Buffer.concat(chunks).toString()) }));
  });
  req.on("error", reject);
  req.end(JSON.stringify(body));
});

// Generate a real PNG with enough random pixels to exceed Express's old 100KB limit.
function drawingPng() {
  const crc32 = (bytes) => {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const size = Buffer.alloc(4), crc = Buffer.alloc(4), tag = Buffer.from(type);
    size.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([tag, data])));
    return Buffer.concat([size, tag, data, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(256, 0); header.writeUInt32BE(256, 4); header[8] = 8; header[9] = 2;
  const rows = Buffer.concat(Array.from({ length: 256 }, () => Buffer.concat([Buffer.from([0]), randomBytes(256 * 3)])));
  const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", header), chunk("IDAT", deflateSync(rows)), chunk("IEND", Buffer.alloc(0))]);
  return "data:image/png;base64," + png.toString("base64");
}

it("accepts a drawing larger than 100KB and connects the uploaded media to the entry", async () => {
  const drawing = drawingPng();
  expect(drawing.length).toBeGreaterThan(100 * 1024);
  const response = await post({ name: "Test", message: "Hello", drawing });
  expect(response.status).toBe(201);
  expect(strapi.strapiUploadMedia).toHaveBeenCalledWith(expect.any(Buffer), expect.stringMatching(/\.png$/));
  expect(strapi.strapiPost).toHaveBeenCalledWith("/api/guestbook-entries", { data: expect.objectContaining({ drawing: 42 }) });
  expect(response.body.entry.drawing).toBe("https://example.com/drawing.png");
  expect(strapi.invalidateCache.mock.calls).toEqual([["/api/guestbook"], ["/api/guestbook-entries"]]);
});

it("returns a visible error and does not create an entry if image upload fails", async () => {
  strapi.strapiUploadMedia.mockRejectedValueOnce(new Error("upload offline"));
  const response = await post({ name: "Test", drawing: drawingPng() });
  expect(response.status).toBe(502);
  expect(response.body.error).toContain("drawing upload failed");
  expect(strapi.strapiPost).not.toHaveBeenCalled();
});

it("rejects malformed image data before contacting Strapi", async () => {
  expect((await post({ name: "Test", drawing: "data:image/png;base64,aGVsbG8=" })).status).toBe(400);
  expect(strapi.strapiUploadMedia).not.toHaveBeenCalled();
  expect(strapi.strapiPost).not.toHaveBeenCalled();
});

it("returns invalid JSON errors in the shared API format", async () => {
  const result = await new Promise((resolve, reject) => {
    const req = request({ hostname: "127.0.0.1", port: server.address().port,
      path: "/api/guestbook", method: "POST",
      headers: { host: "shadowform.localhost", "content-type": "application/json" },
    }, res => {
      let body = "";
      res.on("data", chunk => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    req.on("error", reject); req.end("{");
  });
  expect(result).toEqual({ status: 400, body: { error: "invalid JSON" } });
  expect(strapi.strapiPost).not.toHaveBeenCalled();
});
