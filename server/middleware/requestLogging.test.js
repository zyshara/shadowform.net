// @vitest-environment node
import { EventEmitter } from "node:events";
import { afterEach, expect, it, vi } from "vitest";
import { requestLogging } from "./requestLogging.js";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
function response(statusCode) { return Object.assign(new EventEmitter(), { statusCode }); }
const req = path => ({ path, method: "GET", header: () => "domeofdoom.localhost", originalUrl: `${path}?code=PRIVATE` });

it("logs tenant/method, status and timing without incoming query strings", () => {
  vi.stubEnv("LOG_LEVEL", "info");
  const output = vi.spyOn(console, "log").mockImplementation(() => {});
  const res = response(200), next = vi.fn();
  requestLogging(req("/catalog"), res, next);
  res.emit("finish"); res.emit("close");
  expect(next).toHaveBeenCalledOnce();
  expect(output).toHaveBeenCalledExactlyOnceWith(expect.any(String), "[info]", "[domeofdoom][GET]", "/catalog", { status: 200, durationMs: expect.any(Number) });
  expect(JSON.stringify(output.mock.calls)).not.toContain("PRIVATE");
});

it("keeps successful assets quiet at info but records failures and aborted requests", () => {
  vi.stubEnv("LOG_LEVEL", "info");
  const info = vi.spyOn(console, "log").mockImplementation(() => {});
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const asset = response(200);requestLogging(req("/assets/main.js"), asset, () => {});asset.emit("finish");
  expect(info).not.toHaveBeenCalled();
  const missing = response(404);requestLogging(req("/missing"), missing, () => {});missing.emit("finish");
  expect(warn).toHaveBeenCalledOnce();
  const failed = response(502);requestLogging(req("/catalog"), failed, () => {});failed.emit("finish");
  expect(error).toHaveBeenCalledOnce();
  const aborted = response(200);requestLogging(req("/catalog"), aborted, () => {});aborted.emit("close");
  expect(warn).toHaveBeenCalledTimes(2);
});
