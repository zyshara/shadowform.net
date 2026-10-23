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

it("bypasses cache reads and writes and deduplicates normal reads", async () => {
  vi.resetModules();
  let value = 0;
  const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ value: ++value }) }));
  vi.stubGlobal("fetch", fetch);
  const { strapiGet } = await import("./strapi.js");
  expect((await strapiGet("/api/test", {}, { noCache: true })).value).toBe(1);
  const pair = await Promise.all([strapiGet("/api/test"), strapiGet("/api/test")]);
  expect(pair.map(x => x.value)).toEqual([2, 2]);
  expect((await strapiGet("/api/test", {}, { noCache: true })).value).toBe(3);
  expect((await strapiGet("/api/test")).value).toBe(2);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("invalidates guestbook variants without evicting EPK queries", async () => {
  vi.resetModules();
  const fetch = vi.fn(async () => ({ ok: true, json: async () => ({ data: [] }) }));
  vi.stubGlobal("fetch", fetch);
  const { strapiGet, invalidateCache } = await import("./strapi.js");
  await strapiGet("/api/guestbook", { populate: "tags" });
  await strapiGet("/api/guestbook", { populate: "entries" });
  await strapiGet("/api/epk-pages", { slug: "redspear" });
  invalidateCache("/api/guestbook");
  await strapiGet("/api/epk-pages", { slug: "redspear" });
  expect(fetch).toHaveBeenCalledTimes(3);
  await strapiGet("/api/guestbook", { populate: "tags" });
  await strapiGet("/api/guestbook", { populate: "entries" });
  expect(fetch).toHaveBeenCalledTimes(5);
});

it("uses one timed transport for JSON writes and multipart uploads", async () => {
  vi.resetModules();
  const fetch = vi.fn(async () => ({ ok: true, json: async () => [{ id: 42 }] }));
  vi.stubGlobal("fetch", fetch);
  const { strapiPost, strapiPut, strapiUploadMedia } = await import("./strapi.js");
  await strapiPost("/api/test", { data: { name: "test" } });
  await strapiPut("/api/test/1", { data: {} });
  expect(await strapiUploadMedia(Buffer.from("image"), "test.png")).toEqual({ id: 42 });
  expect(fetch.mock.calls.map(([, init]) => init.method)).toEqual(["POST", "PUT", "POST"]);
  for (const [, init] of fetch.mock.calls) expect(init.signal).toBeInstanceOf(AbortSignal);
  expect(fetch.mock.calls[0][1].headers["Content-Type"]).toBe("application/json");
  expect(fetch.mock.calls[2][1].headers["Content-Type"]).toBeUndefined();
  expect(fetch.mock.calls[2][1].body).toBeInstanceOf(FormData);
});

it("logs HTTP methods and decoded query objects at info without logging write bodies", async () => {
  vi.resetModules();
  vi.stubEnv("LOG_LEVEL", "info");
  const output = vi.spyOn(console, "log").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ data: [] }) })));
  try {
    const { strapiGet, strapiPost, strapiPut } = await import("./strapi.js");
    await strapiGet("/api/artists", { "populate[artist]": "*", "filters[slug][$eq]": "low-poly" });
    await strapiPost("/api/guestbook", { data: { message: "DO_NOT_LOG_CONTENT" } });
    await strapiPut("/api/guestbook", { data: {} });
    const calls = output.mock.calls;
    const get = calls.find(args => args[2] === "[strapi][GET]" && args[4]?.event === "request");
    expect(get[1]).toBe("[info]");
    expect(get[3]).toMatch(/\/api\/artists$/);
    expect(get[4].query).toEqual({ "populate[artist]": "*", "filters[slug][$eq]": "low-poly" });
    expect(calls.some(args => args[2] === "[strapi][POST]")).toBe(true);
    expect(calls.some(args => args[2] === "[strapi][PUT]")).toBe(true);
    expect(calls.some(args => args[4]?.event === "response" && args[4].status === 200)).toBe(true);
    expect(JSON.stringify(calls)).not.toContain("DO_NOT_LOG_CONTENT");
  } finally { output.mockRestore(); }
});
