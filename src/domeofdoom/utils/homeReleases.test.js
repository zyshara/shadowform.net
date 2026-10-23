import { expect, it } from "vitest";
import { selectHomeReleases } from "./homeReleases";

const now = Date.parse("2026-10-23T12:00:00Z");
const release = (title, release_date, type = "Single") => ({ title, release_date, type });

it("shows the two latest releases with only the first labeled when nothing is upcoming", () => {
  const latest = release("Latest", "2026-10-23");
  const previous = release("Previous", "2026-10-01", "Album");
  expect(selectHomeReleases([
    release("Older", "2025-01-01"), previous, latest,
    release("Compilation", "2026-10-23T11:00:00Z", "Compilation"),
  ], now)).toEqual([{ item: latest, showLabel: true }, { item: previous, showLabel: false }]);
});

it("shows the nearest upcoming release and latest released item, both labeled", () => {
  const latest = release("Latest", "2026-10-01", "EP");
  const next = release("Next", "2026-11-01");
  expect(selectHomeReleases([
    release("Later", "2027-01-01"), next,
    release("Upcoming compilation", "2026-10-24", "Compilation"),
    release("Recent compilation", "2026-10-22", "compilation"),
    latest, release("Older", "2026-09-01"),
  ], now)).toEqual([{ item: next, showLabel: true }, { item: latest, showLabel: true }]);
});

it("ignores missing and invalid dates without duplicating sparse catalog entries", () => {
  const next = release("Next", "2026-11-01");
  expect(selectHomeReleases([next, release("Unknown", null), release("Invalid", "invalid")], now))
    .toEqual([{ item: next, showLabel: true }]);
  expect(selectHomeReleases([], now)).toEqual([]);
});

it("treats the release timestamp itself as released", () => {
  const latest = release("Today", new Date(now).toISOString());
  const previous = release("Yesterday", "2026-10-22");
  expect(selectHomeReleases([previous, latest], now)).toEqual([
    { item: latest, showLabel: true }, { item: previous, showLabel: false },
  ]);
});
