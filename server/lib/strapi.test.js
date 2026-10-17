// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("expires the cache using a numeric environment TTL and isolates artist queries", async () => {
  vi.resetModules();
  vi.stubEnv("STRAPI_CACHE_TTL_MS", "1000");
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-17T00:00:00Z"));
  const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ data: [] }) }));
  vi.stubGlobal("fetch", fetch);
  const { getEpkBySlug } = await import("./epk.js");
  await getEpkBySlug("redspear");
  await getEpkBySlug("redspear");
  expect(fetch).toHaveBeenCalledTimes(1);
  await getEpkBySlug("low-poly");
  expect(fetch).toHaveBeenCalledTimes(2);
  vi.advanceTimersByTime(1001);
  await getEpkBySlug("redspear");
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("does not cache failed Strapi requests", async () => {
  vi.resetModules();
  const fetch = vi.fn(async () => ({ ok: false, status: 503, statusText: "Unavailable", text: async () => "offline" }));
  vi.stubGlobal("fetch", fetch);
  const { getEpkBySlug } = await import("./epk.js");
  await expect(getEpkBySlug("redspear")).rejects.toThrow("Strapi 503");
  await expect(getEpkBySlug("redspear")).rejects.toThrow("Strapi 503");
  expect(fetch).toHaveBeenCalledTimes(2);
});
