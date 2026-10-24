import { expect, it } from "vitest";
import { RouterContextProvider } from "react-router";
import { servicesContext } from "../context";
import { loader as releaseLoader } from "./catalog-item";
import { loader as artistLoader } from "./artist";
import { shouldRevalidate } from "./catalog";

function contextFor(services) {
  const context = new RouterContextProvider();
  context.set(servicesContext, services);
  return context;
}

it("resolves catalog numbers and sends only the selected release and linked artists", async () => {
  const release = { uid: "release1", catalog_number: "DOD_001", title: "First", artists: ["Artist One"] };
  const context = contextFor({
    getCatalog: async () => [release, { uid: "release2", title: "Second" }],
    getArtists: async () => [{ name: "Artist One" }, { name: "Artist Two" }],
  });
  const result = await releaseLoader({ context, params: { catalogParam: "dod_001" } });
  expect(result.allItems).toEqual([release]);
  expect(result.roster).toEqual([{ name: "Artist One" }]);
});

it("returns a genuine 404 for missing releases and artists", async () => {
  const context = contextFor({ getCatalog: async () => [], getArtists: async () => [] });
  await expect(releaseLoader({ context, params: { catalogParam: "missing" } })).rejects.toMatchObject({ status: 404 });
  await expect(artistLoader({ context, params: { artistSlug: "missing" } })).rejects.toMatchObject({ status: 404 });
});

it("does not reload the catalog for browser-only filter changes", () => {
  expect(shouldRevalidate({
    currentUrl: new URL("https://example.com/catalog"),
    nextUrl: new URL("https://example.com/catalog?sort=az"),
    defaultShouldRevalidate: true,
  })).toBe(false);
});


it("uses CMS inventory without silently merging prototype shows", async () => {
  const { loader } = await import("./shows");
  const context = contextFor({ getEventIndex: async () => ({ enabled: true, shows: [] }) });
  expect((await loader({ context })).shows).toEqual([]);
});
it("uses CMS event pages and returns 404 for unpublished/missing CMS pages", async () => {
  const { loader } = await import("./show-page");
  const context = contextFor({ getEventPage: async () => ({ enabled: true, content: null }) });
  await expect(loader({ context, params: { showSlug: "maybe-forever-dome-of-doom-takeover-2023" } })).rejects.toMatchObject({ status: 404 });
});
