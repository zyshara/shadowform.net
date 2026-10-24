import { expect, it } from "vitest";
import { RouterContextProvider } from "react-router";
import { servicesContext } from "../context";
import { loader as releaseLoader } from "./catalog-item";
import { loader as artistLoader } from "./artist";
import { shouldRevalidate, loader as catalogLoader } from "./catalog";
import { loader as homeLoader } from "./home";
import { catalogItemSlug } from "../../utils/catalogItemSlug";

function contextFor(services) {
  const context = new RouterContextProvider();
  context.set(servicesContext, services);
  return context;
}

it("keeps catalog filter, sort, and link fields while excluding detail-only data", async () => {
  const release = { uid: "release1", title: "First", catalog_number: "DOD_001", artists: ["Artist One"],
    formats: ["Vinyl"], label_role: "reissue", type: "Album", release_date: "2026-01-01", artwork_url: "cover.jpg",
    tracks: [{ title: "Track" }], packages: [{ price: 10 }], description: "Long description" };
  const { allItems } = await catalogLoader({ context: contextFor({ getCatalog: async () => [release] }) });
  expect(allItems[0]).toEqual({ uid: release.uid, title: release.title, catalog_number: release.catalog_number,
    artists: release.artists, formats: release.formats, label_role: release.label_role, type: release.type,
    release_date: release.release_date, artwork_url: release.artwork_url });
  expect(catalogItemSlug(allItems[0])).toBe(catalogItemSlug(release));
  expect(release.tracks).toHaveLength(1);
});

it("selects only Home's two releases and latest compilation with descriptions and listening links", async () => {
  const releases = [
    { uid: "latest", type: "Album", title: "Latest", release_date: "2020-01-01", description: "Description", bandcamp_url: "https://example.com/listen", tracks: [1], packages: [2] },
    { uid: "older", type: "Album", release_date: "2019-01-01" },
    { uid: "oldest", type: "Album", release_date: "2018-01-01" },
    { uid: "compilation", type: "Compilation", release_date: "2020-01-01" },
    { uid: "old-compilation", type: "Compilation", release_date: "2010-01-01" },
  ];
  const result = await homeLoader({ context: contextFor({ getCatalog: async () => releases }) });
  expect(result.cards.map(card => card.item.uid)).toEqual(["latest", "older"]);
  expect(result.latestCompilation.uid).toBe("compilation");
  expect(result.cards[0].item).toMatchObject({ description: "Description", bandcamp_url: "https://example.com/listen" });
  expect(result.cards[0].item).not.toHaveProperty("tracks");
  expect(result.cards[0].item).not.toHaveProperty("packages");
  expect(result).not.toHaveProperty("catalogItems");
});

it("handles an empty homepage catalog", async () => {
  expect(await homeLoader({ context: contextFor({ getCatalog: async () => [] }) })).toMatchObject({ cards: [], latestCompilation: null });
});

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
