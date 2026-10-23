// Manual public-catalog backfill. Dry-run by default; --apply writes verified
// matches only. Existing overrides are preserved. Never scheduled by cron.
// node --env-file=.env server/apps/domeofdoom/scripts/backfillCatalogSpotify.js [--apply]
import { writeFile } from "node:fs/promises";
import { strapiGetAllPages, strapiGet, strapiPut } from "#lib/strapi.js";
import { spotifyGet } from "#lib/spotify.js";
import { exactCandidates, domeAttribution, isEp, spotifySearchTitle } from "./spotifyCatalogMatch.js";

const path = "/api/dome-of-doom-catalog-items";
const apply = process.argv.includes("--apply");
const epOnly = process.argv.includes("--ep-only");
const reportPath = process.env.SPOTIFY_BACKFILL_REPORT || "/tmp/dod-spotify-backfill.json";
const report = { startedAt: new Date().toISOString(), apply, entries: [] };
const save = () => writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
const pause = () => new Promise((resolve) => setTimeout(resolve, 350));

try {
  const items = await strapiGetAllPages(path, { "populate[derived][populate]": "*", "populate[overrides][populate]": "*" });
  for (const item of items) {
    if (epOnly && (item.overrides?.spotify_url || !isEp(item))) continue;
    const title = item.overrides?.title || item.derived?.title;
    const artist = item.derived?.artists?.[0]?.name;
    const row = { documentId: item.documentId, title, artist, bandcampUrl: item.bandcamp_url };
    report.entries.push(row);
    if (item.overrides?.spotify_url) {
      Object.assign(row, { status: "existing", spotifyUrl: item.overrides.spotify_url });
      continue;
    }
    if (!title || !artist) { row.status = "missing-metadata"; continue; }
    try {
      row.searchTitle = spotifySearchTitle(item);
      const result = await spotifyGet(`/search?type=album&limit=10&q=${encodeURIComponent(`${row.searchTitle} ${artist}`)}`);
      const candidates = result.albums?.items || [];
      row.candidates = candidates.map((c) => ({ id: c.id, title: c.name, artists: c.artists?.map((a) => a.name), date: c.release_date, url: c.external_urls?.spotify }));
      const exact = exactCandidates(item, candidates);
      const verified = [];
      for (const candidate of exact) {
        await pause();
        const detail = await spotifyGet(`/albums/${candidate.id}`);
        if (domeAttribution(detail)) verified.push(detail);
      }
      if (verified.length !== 1) {
        row.status = verified.length > 1 ? "ambiguous" : "unresolved";
      } else {
        const match = verified[0];
        Object.assign(row, { status: "matched", spotifyUrl: `https://open.spotify.com/album/${match.id}`, attribution: domeAttribution(match) });
        if (apply) {
          const params = { "populate[overrides][populate]": "*" };
          const fresh = (await strapiGet(`${path}/${item.documentId}`, params, { noCache: true })).data;
          if (fresh.overrides?.spotify_url) {
            row.status = "existing";
            row.spotifyUrl = fresh.overrides.spotify_url;
          } else {
            const overrides = { ...fresh.overrides, spotify_url: row.spotifyUrl };
            if (overrides.primary_image && typeof overrides.primary_image === "object") overrides.primary_image = overrides.primary_image.id;
            await strapiPut(`${path}/${item.documentId}`, { data: { overrides } });
            const saved = (await strapiGet(`${path}/${item.documentId}`, params, { noCache: true })).data;
            if (saved.overrides?.spotify_url !== row.spotifyUrl) throw new Error("Saved URL failed read-back verification");
            row.status = "updated";
          }
        }
      }
    } catch (error) {
      row.status = "error";
      row.error = error.message;
      if ([401, 403, 429].includes(error.status)) throw error;
    }
    console.log(`${report.entries.length}/${items.length} ${row.status}: ${title}`);
    await save();
    await pause();
  }
} finally {
  report.summary = report.entries.reduce((counts, row) => ({ ...counts, [row.status]: (counts[row.status] || 0) + 1 }), {});
  await save();
  console.log(JSON.stringify({ reportPath, ...report.summary }));
}
