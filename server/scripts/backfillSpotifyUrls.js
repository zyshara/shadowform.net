// server/scripts/backfillSpotifyUrls.js
//
// For every Dome of Doom Release in Strapi missing `spotify_url`, uses the
// tuned matcher from lib/releaseMatching.js (matchSpotifyRelease) to find
// its Spotify album and writes the link back.
//
// Confidence check: if the release already has a `release_date` in Strapi
// and the matched Spotify album's release date is more than a year away,
// that's a strong signal the title matched but it's actually a different
// release (reissue, rerelease under a same-titled album, etc.) — those are
// held back from auto-write and printed in a REVIEW list at the end instead
// of being written blindly.
//
// Safe to re-run: skips releases that already have `spotify_url` set.
//
// Usage:
//   node server/scripts/backfillSpotifyUrls.js [--dry-run]

import "dotenv/config";
import { strapiGet, strapiPut } from "../lib/strapi.js";
import { matchSpotifyRelease } from "../lib/releaseMatching.js";

const RELEASES_PATH = "/api/dome-of-doom-releases";
const PAGE_SIZE     = 100;
const DELAY_MS      = 400;

// Not out yet / not on Spotify — matching would only ever produce noise.
const SKIP_NAMES = new Set(["Dome of Doom 15 Year Anniversary Compilation"]);

// Matched Spotify release date more than this many days from Strapi's own
// release_date is treated as a same-title-different-release false positive.
const REVIEW_THRESHOLD_DAYS = 365;

const DRY_RUN = process.argv.includes("--dry-run");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllReleases() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      RELEASES_PATH,
      {
        "fields[0]": "name",
        "fields[1]": "spotify_url",
        "fields[2]": "release_date",
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

// Some legacy entries store the release name as "Artist - Title" (Bandcamp
// duplicated the artist in the title text) rather than just "Title" — that
// prefix never appears in Spotify's own album name, so it silently sinks
// the title match. Only strip it when it exactly matches a linked artist's
// name — never a guess, since we already know that name from the relation.
function stripArtistPrefix(name, artistNames) {
  for (const a of artistNames) {
    const prefix = `${a} - `;
    if (name.toLowerCase().startsWith(prefix.toLowerCase())) {
      return name.slice(prefix.length).trim();
    }
  }
  return name;
}

function daysBetween(isoA, isoB) {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.abs(a - b) / (1000 * 60 * 60 * 24);
}

async function main() {
  if (DRY_RUN) console.log("--- DRY RUN ---\n");

  console.log("Fetching releases from Strapi...");
  const releases = await fetchAllReleases();
  console.log(`  ${releases.length} total releases\n`);

  const stats = { ok: 0, alreadySet: 0, skippedName: 0, noMatch: 0, review: 0, error: 0 };
  const reviewList = [];

  for (const entry of releases) {
    const docId       = entry.documentId ?? entry.id;
    const name        = entry.name ?? entry.attributes?.name ?? "(unnamed)";
    const spotifyUrl  = entry.spotify_url ?? entry.attributes?.spotify_url;
    const releaseDate = entry.release_date ?? entry.attributes?.release_date;
    const linkedArtists = Array.isArray(entry.artists) ? entry.artists : entry.attributes?.artists?.data ?? [];
    // Bandcamp's scraped artist string (e.g. "DMVU & FINNOH") is what the
    // matcher was tuned against — reconstruct that shape from the relation
    // so the same DOMEOFDOOM-label-account branch in releaseMatching.js applies.
    const artistNames = linkedArtists.map((a) => a.name ?? a.attributes?.name).filter(Boolean);
    const artist = artistNames.join(" & ");
    const searchName = stripArtistPrefix(name, artistNames);

    if (SKIP_NAMES.has(name)) {
      stats.skippedName++;
      continue;
    }

    if (spotifyUrl) {
      stats.alreadySet++;
      continue;
    }

    if (!artist) {
      console.warn(`  [skip no-artist] ${name}`);
      continue;
    }

    try {
      const match = await matchSpotifyRelease({ artist, release_name: searchName });

      if (!match) {
        console.log(`  [no match] ${artist} — ${name}`);
        stats.noMatch++;
        await sleep(DELAY_MS);
        continue;
      }

      const gapDays = releaseDate && match.release_date ? daysBetween(releaseDate, match.release_date) : null;
      const lowConfidence = gapDays !== null && gapDays > REVIEW_THRESHOLD_DAYS;

      if (lowConfidence) {
        console.warn(
          `  [REVIEW] ${artist} — ${name}: matched ${match.spotify_url} ` +
          `(spotify date ${match.release_date}, strapi date ${releaseDate?.slice(0, 10)}, ` +
          `${Math.round(gapDays)}d apart)`
        );
        reviewList.push({ name, artist, spotify_url: match.spotify_url, releaseDate, spotifyDate: match.release_date });
        stats.review++;
        await sleep(DELAY_MS);
        continue;
      }

      if (DRY_RUN) {
        console.log(`  [dry] ${artist} — ${name} → ${match.spotify_url}`);
      } else {
        await strapiPut(`${RELEASES_PATH}/${docId}`, { data: { spotify_url: match.spotify_url } });
        console.log(`  [ok]  ${artist} — ${name} → ${match.spotify_url}`);
      }
      stats.ok++;
    } catch (err) {
      console.error(`  [err] ${artist} — ${name}: ${err.message}`);
      stats.error++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone.`);
  console.log(
    `  ${stats.ok} matched, ${stats.alreadySet} already set, ${stats.skippedName} skipped by name, ` +
    `${stats.noMatch} no match, ${stats.review} held for review, ${stats.error} errors`
  );

  if (reviewList.length > 0) {
    console.log(`\n--- Needs manual review (release date mismatch) ---`);
    for (const r of reviewList) {
      console.log(`  ${r.artist} — ${r.name}`);
      console.log(`    strapi:  ${r.releaseDate?.slice(0, 10) ?? "(none)"}`);
      console.log(`    spotify: ${r.spotifyDate}  ${r.spotify_url}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
