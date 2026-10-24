import { afterEach, expect, it, vi } from "vitest";
import { createCachedClientLoader } from "./clientCache";

afterEach(() => vi.useRealTimers());
const args = (path, serverLoader) => ({ request: new Request(`https://example.com${path}`), serverLoader });

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

it("shares a pending preload with navigation and subsequent consumers", async () => {
  const load = createCachedClientLoader();
  const response = deferred();
  const serverLoader = vi.fn(() => response.promise);
  const preload = load(args("/catalog?_preload=1", serverLoader));
  const navigation = load(args("/catalog", serverLoader));
  await Promise.resolve();
  expect(serverLoader).toHaveBeenCalledTimes(1);
  response.resolve({ items: [1] });
  expect(await preload).toEqual({ items: [1] });
  expect(await navigation).toEqual({ items: [1] });
  await load(args("/catalog", serverLoader));
  expect(serverLoader).toHaveBeenCalledTimes(1);
});

it("retries navigation immediately if its pending preload is cancelled", async () => {
  const load = createCachedClientLoader();
  const response = deferred();
  const controller = new AbortController();
  const preload = load({ request: new Request("https://example.com/catalog?_preload=1", { signal: controller.signal }), serverLoader: () => response.promise });
  const serverLoader = vi.fn(async () => ({ fresh: true }));
  const navigation = load(args("/catalog", serverLoader));
  controller.abort();
  expect(await navigation).toEqual({ fresh: true });
  expect(serverLoader).toHaveBeenCalledTimes(1);
  response.resolve({ stale: true });
  await preload;
  expect(await load(args("/catalog", serverLoader))).toEqual({ fresh: true });
});

it("silences a shared failure only for the speculative caller and permits retry", async () => {
  const load = createCachedClientLoader();
  const response = deferred();
  const preload = load(args("/press?_preload=1", () => response.promise));
  const navigation = load(args("/press", vi.fn()));
  const failure = expect(navigation).rejects.toThrow("offline");
  response.reject(new Error("offline"));
  expect(await preload).toBeNull();
  await failure;
  expect(await load(args("/press", async () => ({ ok: true })))).toEqual({ ok: true });
});

it("does not let an abandoned navigation cancel or poison a shared preload", async () => {
  const load = createCachedClientLoader();
  const response = deferred();
  const serverLoader = vi.fn(() => response.promise);
  const preload = load(args("/roster?_preload=1", serverLoader));
  const controller = new AbortController();
  const navigation = load({ request: new Request("https://example.com/roster", { signal: controller.signal }), serverLoader });
  controller.abort();
  response.resolve({ artists: [1] });
  await Promise.all([preload, navigation]);
  expect(await load(args("/roster", serverLoader))).toEqual({ artists: [1] });
  expect(serverLoader).toHaveBeenCalledTimes(1);
});

it("ignores speculative preload failures and retries on real navigation", async () => {
  const load = createCachedClientLoader();
  const serverLoader = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ ok: true });
  expect(await load(args("/catalog?_preload=1", serverLoader))).toBeNull();
  expect(await load(args("/catalog", serverLoader))).toEqual({ ok: true });
  expect(serverLoader).toHaveBeenCalledTimes(2);
});

it("reuses data for the page lifecycle regardless of elapsed time", async () => {
  vi.useFakeTimers();
  const load = createCachedClientLoader();
  const serverLoader = vi.fn().mockResolvedValueOnce({ items: [1] }).mockResolvedValue({ items: [2] });
  expect(load.hydrate).toBe(true);
  expect(await load(args("/catalog", serverLoader))).toEqual({ items: [1] });
  expect(await load(args("/catalog?sort=az", serverLoader))).toEqual({ items: [1] });
  expect(serverLoader).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(24 * 60 * 60 * 1000);
  expect(await load(args("/catalog", serverLoader))).toEqual({ items: [1] });
  expect(serverLoader).toHaveBeenCalledTimes(1);
  // A new document gets new module memory and a fresh loader cache.
  const nextPageLoad = createCachedClientLoader();
  expect(await nextPageLoad(args("/catalog", serverLoader))).toEqual({ items: [2] });
  expect(serverLoader).toHaveBeenCalledTimes(2);
});

it("keeps detail pages separate and bounds retained entries", async () => {
  const load = createCachedClientLoader({ maxEntries: 2 });
  const serverLoader = vi.fn(async () => ({ call: serverLoader.mock.calls.length }));
  await load(args("/catalog/a", serverLoader));
  await load(args("/catalog/b", serverLoader));
  expect(await load(args("/catalog/a", serverLoader))).toEqual({ call: 1 });
  await load(args("/catalog/c", serverLoader));
  await load(args("/catalog/a", serverLoader));
  expect(serverLoader).toHaveBeenCalledTimes(4);
});

it("retries failed or cancelled loads rather than caching them", async () => {
  const load = createCachedClientLoader();
  const serverLoader = vi.fn().mockRejectedValueOnce(new Response(null, { status: 404 })).mockResolvedValue({ ok: true });
  await expect(load(args("/roster/a", serverLoader))).rejects.toMatchObject({ status: 404 });
  const controller = new AbortController();
  controller.abort();
  await load({ request: new Request("https://example.com/roster/a", { signal: controller.signal }), serverLoader });
  await load(args("/roster/a", serverLoader));
  expect(serverLoader).toHaveBeenCalledTimes(3);
});
