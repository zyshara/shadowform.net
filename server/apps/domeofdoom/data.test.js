// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";

vi.mock("#lib/strapi.js", () => ({
  strapiGetAllPages: vi.fn(), strapiGet: vi.fn(),
  resolveMediaUrl: (media) => media?.url ?? null,
}));

afterEach(() => {
  vi.useRealTimers(); vi.unstubAllEnvs(); vi.resetAllMocks(); vi.resetModules();
});

it("uses the catalog Spotify override and omits placeholder links", async () => {
  const { normalizeCatalogItem } = await import("./models/catalogItem.js");
  const base = { documentId: "release", derived: { title: "Compilation" } };
  const spotifyUrl = "https://open.spotify.com/album/4sy6ZZqrc7AUNXMEEfqfJT";
  expect(normalizeCatalogItem({ ...base, overrides: { spotify_url: spotifyUrl }, spotify_url: "https://example.com/old" }).spotify_url).toBe(spotifyUrl);
  expect(normalizeCatalogItem(base).spotify_url).toBeNull();
  expect(normalizeCatalogItem({ ...base, spotify_url: spotifyUrl }).spotify_url).toBe(spotifyUrl);
  expect(normalizeCatalogItem({ ...base, overrides: { spotify_url: `${spotifyUrl}?si=sharing-token#fragment` } }).spotify_url).toBe(spotifyUrl);
  expect(normalizeCatalogItem({ ...base, overrides: { spotify_url: "   " } }).spotify_url).toBeNull();
});

it("shares cold collection loads and refreshes on demand after expiry", async () => {
  vi.resetModules();
  vi.stubEnv("STRAPI_CACHE_TTL_MS", "1000");
  vi.useFakeTimers();
  const { strapiGetAllPages } = await import("#lib/strapi.js");
  strapiGetAllPages.mockResolvedValue([{ documentId: "artist1", name: "Test Artist" }]);
  const { getArtists } = await import("./data.js");
  const [first, second] = await Promise.all([getArtists(), getArtists()]);
  expect(first).toEqual(second);
  expect(first[0].name).toBe("Test Artist");
  expect(strapiGetAllPages).toHaveBeenCalledTimes(1);
  await getArtists();
  expect(strapiGetAllPages).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(1001);
  await getArtists();
  expect(strapiGetAllPages).toHaveBeenCalledTimes(2);
});

it("joins show photos from Strapi artist records without a Bandcamp request", async () => {
  vi.resetModules();
  const { strapiGetAllPages } = await import("#lib/strapi.js");
  strapiGetAllPages.mockImplementation(async (path) => path.endsWith("-shows")
    ? [{ documentId: "show1", name: "Test Show", date: "2027-01-01", artists: [{ name: "Test Artist" }] }]
    : [{ documentId: "artist1", name: "Test Artist", overrides: { profile_picture: { url: "https://example.com/artist.jpg" } } }]);
  const { getShows } = await import("./data.js");
  const shows = await getShows();
  expect(shows[0].artists).toEqual([{ name: "Test Artist", pfp: "https://example.com/artist.jpg" }]);
  expect(strapiGetAllPages).toHaveBeenCalledWith("/api/dome-of-doom-artists", expect.any(Object));
});

it("retries failed reads instead of caching an empty collection", async () => {
  vi.resetModules();
  const { strapiGetAllPages } = await import("#lib/strapi.js");
  strapiGetAllPages.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([]);
  const { getCatalog } = await import("./data.js");
  await expect(getCatalog()).rejects.toThrow("offline");
  await expect(getCatalog()).resolves.toEqual([]);
  expect(strapiGetAllPages).toHaveBeenCalledTimes(2);
});
