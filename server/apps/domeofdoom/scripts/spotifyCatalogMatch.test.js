import { expect, it } from "vitest";
import { exactCandidates, isDomeLabel, domeAttribution, spotifySearchTitle } from "./spotifyCatalogMatch.js";

const item = { derived: { title: "CH405", artists: [{ name: "deadclou" }], release_date: "2026-08-21" } };
const candidate = { id: "one", name: "CH405", artists: [{ name: "deadclou" }], release_date: "2026-08-21" };
it("searches and matches EPs with the standalone suffix omitted", () => {
  const ep = { derived: { ...item.derived, title: "Ignite EP", suggested_type: "ep" } };
  expect(spotifySearchTitle(ep)).toBe("Ignite");
  expect(exactCandidates(ep, [{ ...candidate, name: "Ignite" }])).toHaveLength(1);
  expect(exactCandidates(ep, [{ ...candidate, name: "Ignite (Remixes)" }])).toEqual([]);
  expect(spotifySearchTitle({ derived: { title: "Deep", suggested_type: "ep" } })).toBe("Deep");
  expect(spotifySearchTitle({ derived: { title: "Puffin (EP)" } })).toBe("Puffin");
});
it("requires title, artist, and release year agreement", () => {
  expect(exactCandidates(item, [candidate, { ...candidate, id: "wrong-artist", artists: [{ name: "Someone Else" }] }, { ...candidate, id: "wrong-year", release_date: "2025-08-21" }, { ...candidate, id: "remix", name: "CH405 (Remix)" }])).toEqual([candidate]);
});
it("normalizes punctuation and accents without accepting missing metadata", () => {
  expect(exactCandidates({ derived: { title: "Café / Moon", artists: [{ name: "Artist" }], release_date: "2020-01-01" } }, [{ ...candidate, name: "Cafe - Moon", artists: [{ name: "ARTIST" }], release_date: "2020" }])).toHaveLength(1);
  expect(exactCandidates({ derived: { title: "CH405" } }, [candidate])).toEqual([]);
});
it("deduplicates IDs but retains distinct releases for ambiguity detection", () => {
  expect(exactCandidates(item, [candidate, candidate])).toHaveLength(1);
  expect(exactCandidates(item, [candidate, { ...candidate, id: "two" }])).toHaveLength(2);
});
it("recognizes only the exact Dome of Doom label", () => {
  expect(isDomeLabel("Dome of Doom Records")).toBe(true);
  expect(isDomeLabel("Dome Of Doom")).toBe(true);
  expect(isDomeLabel("Other Label / Dome Of Doom")).toBe(false);
  expect(isDomeLabel()).toBe(false);
});
it("corroborates through copyright when Spotify omits label", () => {
  expect(domeAttribution({ copyrights: [{ text: "2025 Dome of Doom Records" }] })).toBe("2025 Dome of Doom Records");
  expect(domeAttribution({ copyrights: [{ text: "2025 Other Label" }] })).toBeNull();
});
