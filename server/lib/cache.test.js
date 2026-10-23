// @vitest-environment node
import { expect, it, vi } from "vitest";
import { createAsyncCache } from "./cache.js";

it("deduplicates concurrent reads, expires entries, and retries failures", async () => {
  const now = vi.spyOn(Date, "now").mockReturnValue(0);
  try {
    const cache = createAsyncCache();
    const load = vi.fn().mockResolvedValue(1);
    expect(await Promise.all([cache.get("a", load, { ttl: 10 }), cache.get("a", load)])).toEqual([1, 1]);
    expect(load).toHaveBeenCalledTimes(1);
    now.mockReturnValue(11);
    await cache.get("a", load);
    expect(load).toHaveBeenCalledTimes(2);
    const fail = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(2);
    await expect(cache.get("b", fail)).rejects.toThrow("offline");
    expect(await cache.get("b", fail)).toBe(2);
  } finally { now.mockRestore(); }
});

it("does not resurrect an invalidated in-flight result", async () => {
  const cache = createAsyncCache();
  let finish;
  const old = cache.get("a", () => new Promise(resolve => { finish = resolve; }));
  await Promise.resolve();
  cache.invalidate(key => key === "a");
  expect(await cache.get("a", async () => "new")).toBe("new");
  finish("old");
  expect(await old).toBe("old");
  expect(await cache.get("a", async () => "wrong")).toBe("new");
});

it("bounds stored entries", async () => {
  const cache = createAsyncCache({ maxEntries: 1 });
  await cache.get("a", async () => 1);
  await cache.get("b", async () => 2);
  const reload = vi.fn(async () => 3);
  expect(await cache.get("a", reload)).toBe(3);
  expect(reload).toHaveBeenCalledOnce();
});
