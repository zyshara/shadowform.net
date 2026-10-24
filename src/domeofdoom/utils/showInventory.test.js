import { expect, it } from "vitest";
import { filterShows, groupShows, showDateLabel, splitShows } from "./showInventory";
import shows from "../../../server/apps/domeofdoom/scripts/data/reviewed-shows.json";

it("combines type, artist, year and region filters", () => {
  const result = filterShows(shows, { type: "Festival", artist: "Dabow", year: "2025", region: "North America" });
  expect(result).toHaveLength(1);
  expect(result[0].title).toBe("Dabow at FAM Fest");
  expect(filterShows(shows, { type: "Festival", region: "Asia" })).toEqual([]);
});
it("keeps multi-day festivals current through their last day", () => {
  const fixture = [{ id: "festival", date: "2026-10-22", endDate: "2026-10-24" }, { id: "past", date: "2026-10-21" }, { id: "future", date: "2026-11-01" }];
  expect(splitShows(fixture, "2026-10-23").upcoming.map(s => s.id)).toEqual(["festival", "future"]);
  expect(splitShows(fixture, "2026-10-25").past.map(s => s.id)).toEqual(["festival", "past"]);
  expect(splitShows(fixture, "2026-10-25", "oldest").past.map(s => s.id)).toEqual(["past", "festival"]);
});
it("formats ranges without timezone shifts and groups in the selected order", () => {
  expect(showDateLabel({ date: "2019-11-01", endDate: "2019-11-03" })).toBe("Nov 1–3, 2019");
  expect(showDateLabel({ date: "2025-06-07" })).toBe("Jun 7, 2025");
  const { past } = splitShows(shows, "2026-10-23", "oldest");
  expect(groupShows(past)[0].key).toBe("2017");
});

it("ORs multiple choices within a group and ANDs across groups", () => {
  const result = filterShows(shows, {
    type: new Set(["Festival", "Show"]), artist: new Set(["Dabow", "BOSTN"]),
    year: new Set(["2023", "2025"]), region: new Set(),
  });
  expect(result.map(show => show.title).sort()).toEqual(["Dabow at FAM Fest", "Maybe Forever x Dome of Doom Takeover"].sort());
});
