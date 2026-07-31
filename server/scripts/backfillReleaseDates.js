// server/scripts/backfillReleaseDates.js
//
// For every Dome of Doom Release in Strapi:
//   1. Scrapes full release date from Bandcamp → writes `release_date`
//   2. Parses the text `artist` field, splits on " & ", ensures each artist
//      exists in Dome of Doom Artist collection, links them via the `artists`
//      relation.
//
// Safe to re-run: skips releases that already have `release_date` set,
// and skips artist linking if the relation is already populated.
//
// Usage:
//   node server/scripts/backfillReleaseDates.js [--dry-run] [--dates-only] [--artists-only]

import "dotenv/config";
import { strapiGet, strapiPut } from "../lib/strapi.js";
import { splitArtistString, loadArtistCache, ensureArtist } from "../lib/artists.js";
import { scrapeBandcampReleaseDate } from "../cron/scrapers/bandcamp.js";

const RELEASES_PATH = "/api/dome-of-doom-releases";
const PAGE_SIZE     = 100;
const DELAY_MS      = 400;

const DRY_RUN      = process.argv.includes("--dry-run");
const DATES_ONLY   = process.argv.includes("--dates-only");
const ARTISTS_ONLY = process.argv.includes("--artists-only");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Strapi fetch helpers ────────────────────────────────────────────────────

async function fetchAllReleases() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      RELEASES_PATH,
      {
        "fields[0]": "name",
        "fields[1]": "bandcamp_url",
        "fields[2]": "artist",
        "fields[3]": "release_date",
        "populate[artists][fields][0]": "name",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

// ─── Artist helpers (dry-run wrapper around the shared lib) ─────────────────

let artistCache = new Map();

async function ensureArtistOrDryRun(rawName) {
  const name = rawName.trim();
  const key  = name.toUpperCase();
  if (artistCache.has(key)) return artistCache.get(key).docId;

  if (DRY_RUN) {
    console.log(`    [dry] would create artist: "${name}"`);
    const fakeId = `dry-${key}`;
    artistCache.set(key, { docId: fakeId, name });
    return fakeId;
  }

  const docId = await ensureArtist(artistCache, name);
  console.log(`    [new artist] "${name}" → ${docId}`);
  await sleep(200);
  return docId;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) console.log("--- DRY RUN ---\n");

  if (!DATES_ONLY) {
    console.log("Loading existing Dome of Doom Artists...");
    artistCache = await loadArtistCache();
    console.log(`  ${artistCache.size} existing artists loaded\n`);
  }

  console.log("Fetching releases from Strapi...");
  const releases = await fetchAllReleases();
  console.log(`  ${releases.length} total releases\n`);

  const stats = { dateOk: 0, dateSkip: 0, dateFail: 0, artistOk: 0 };

  for (const entry of releases) {
    const docId         = entry.documentId ?? entry.id;
    const name          = entry.name ?? entry.attributes?.name ?? "(unnamed)";
    const url           = entry.bandcamp_url ?? entry.attributes?.bandcamp_url;
    const artistStr     = entry.artist ?? entry.attributes?.artist;
    const releaseDate   = entry.release_date ?? entry.attributes?.release_date;
    // Strapi v5: populated relation is directly an array; v4: under .data
    const linkedArtists = Array.isArray(entry.artists)
      ? entry.artists
      : entry.attributes?.artists?.data ?? [];

    const updates = {};

    // 1 ── Release date ──────────────────────────────────────────────────────
    if (!ARTISTS_ONLY) {
      if (!url) {
        // nothing to scrape
      } else if (releaseDate) {
        // already set — skip
      } else {
        try {
          const iso = await scrapeBandcampReleaseDate(url);
          if (!iso) {
            console.warn(`  [skip date] ${name}`);
            stats.dateSkip++;
          } else {
            updates.release_date = iso;
            stats.dateOk++;
          }
        } catch (err) {
          console.error(`  [err  date] ${name}: ${err.message}`);
          stats.dateFail++;
        }
        await sleep(DELAY_MS);
      }
    }

    // 2 ── Artist relation ───────────────────────────────────────────────────
    if (!DATES_ONLY && linkedArtists.length === 0) {
      const names = splitArtistString(artistStr);
      if (names.length > 0) {
        const docIds = [];
        for (const n of names) {
          const id = await ensureArtistOrDryRun(n);
          if (id) docIds.push(id);
        }
        if (docIds.length > 0) {
          updates.artists = docIds;
          stats.artistOk++;
        }
      }
    }

    // 3 ── Write ─────────────────────────────────────────────────────────────
    if (Object.keys(updates).length === 0) continue;

    const parts = [];
    if (updates.release_date) parts.push(`date=${updates.release_date.slice(0, 10)}`);
    if (updates.artists)      parts.push(`artists=[${splitArtistString(artistStr).join(", ")}]`);

    if (DRY_RUN) {
      console.log(`  [dry] ${name} → ${parts.join(" | ")}`);
    } else {
      try {
        await strapiPut(`${RELEASES_PATH}/${docId}`, { data: updates });
        console.log(`  [ok]  ${name} → ${parts.join(" | ")}`);
      } catch (err) {
        console.error(`  [err  put]  ${name}: ${err.message}`);
        if (err.body) console.error("        ", err.body.slice(0, 200));
      }
    }
  }

  console.log(`\nDone.`);
  console.log(`  Dates:   ${stats.dateOk} set, ${stats.dateSkip} skipped, ${stats.dateFail} errors`);
  console.log(`  Artists: ${stats.artistOk} releases linked`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
