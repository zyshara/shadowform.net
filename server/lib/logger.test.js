// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { createLogger } from "./logger.js";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

it("uses consistent scope/method prefixes and preserves object details", () => {
  vi.stubEnv("LOG_LEVEL", "info");
  const output = vi.spyOn(console, "log").mockImplementation(() => {});
  const log = createLogger("domeofdoom");
  log.info("getCatalog", "loaded", { count: 12 });
  log.debug("getCatalog", "hidden");
  expect(output).toHaveBeenCalledExactlyOnceWith(expect.any(String), "[info]", "[domeofdoom][getCatalog]", "loaded", { count: 12 });
});

it("redacts nested secrets and binaries without mutating arguments", () => {
  vi.stubEnv("LOG_LEVEL", "debug");
  const output = vi.spyOn(console, "log").mockImplementation(() => {});
  const details = { query: { "filters[password][$eq]": "private", "populate[artist]": "*" },
    nested: [{ access_token: "secret" }], authorization: "Bearer secret", drawing: Buffer.from("private") };
  createLogger("strapi").info("GET", "https://example.com/api?token=secret", details);
  const args = output.mock.calls[0];
  expect(JSON.stringify(args)).not.toContain("secret");
  expect(args[4].query["populate[artist]"]).toBe("*");
  expect(args[4].query["filters[password][$eq]"]).toBe("[REDACTED]");
  expect(details.nested[0].access_token).toBe("secret");
});

it("serializes errors without upstream response bodies or request configs", () => {
  const output = vi.spyOn(console, "error").mockImplementation(() => {});
  const error = Object.assign(new Error("offline"), { status: 502, body: "private data", config: { token: "secret" } });
  createLogger("strapi").error("POST", "failed", error);
  expect(output.mock.calls[0][4]).toEqual(expect.objectContaining({ message: "offline", status: 502, stack: expect.any(String) }));
  expect(JSON.stringify(output.mock.calls)).not.toMatch(/private data|secret/);
});
