import { expect, it } from "vitest";
import { selectHomeReleases } from "./homeReleases";

const now = Date.parse("2026-10-23T12:00:00Z");
const release = (title, release_date, type = "Single") => ({ title, release_date, type });

it("selects the latest released item alone when nothing is upcoming", () => {
  const latest = release("Latest", "2026-10-23");
  expect(selectHomeReleases([
    release("Older", "2025-01-01", "Album"), latest,
    release("Compilation", "2026-10-23T11:00:00Z", "Compilation"),
  ], now)).toEqual({ latestRelease: latest, upcomingRelease: null });
});

it("selects the nearest upcoming release and latest released item, excluding compilations", () => {
  const latest = release("Latest", "2026-10-01", "EP");
  const next = release("Next", "2026-11-01");
  expect(selectHomeReleases([
    release("Later", "2027-01-01"), next,
    release("Upcoming compilation", "2026-10-24", "Compilation"),
    release("Recent compilation", "2026-10-22", "compilation"),
    latest, release("Older", "2026-09-01"),
  ], now)).toEqual({ latestRelease: latest, upcomingRelease: next });
});

it("does not classify future, missing, or invalid dates as released", () => {
  const next = release("Next", "2026-11-01");
  expect(selectHomeReleases([next, release("Unknown", null), release("Invalid", "invalid")], now))
    .toEqual({ latestRelease: null, upcomingRelease: next });
  expect(selectHomeReleases([], now)).toEqual({ latestRelease: null, upcomingRelease: null });
});

it("treats the release timestamp itself as released", () => {
  const latest = release("Today", new Date(now).toISOString());
  expect(selectHomeReleases([latest], now)).toEqual({ latestRelease: latest, upcomingRelease: null });
});
