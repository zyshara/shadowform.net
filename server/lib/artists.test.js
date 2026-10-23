// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it("loads every artist page for statistics instead of stopping at Strapi's default page", async () => {
  const fetch = vi.fn(async url => {
    const page = new URL(url).searchParams.get("pagination[page]");
    return { ok: true, json: async () => ({
      data: [{ documentId: `artist-${page}` }], meta: { pagination: { pageCount: 2 } },
    }) };
  });
  vi.stubGlobal("fetch", fetch);
  const { getAllArtists } = await import("./artists.js");
  expect(await getAllArtists()).toEqual([{ documentId: "artist-1" }, { documentId: "artist-2" }]);
  expect(fetch).toHaveBeenCalledTimes(2);
});
