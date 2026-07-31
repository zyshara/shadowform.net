// server/cron/syncDiscography.js
//
// Bandcamp is the source of truth for the release list; Strapi is where it
// gets enriched (Spotify link + release type) and persisted. Flow: scrape
// Bandcamp -> diff against what Strapi already has (by bandcamp_url) -> for
// each new release, match Spotify + classify type + write to Strapi -> then
// re-read everything from Strapi into the bandcampCache singleton the
// frontend reads from.

import { scrapeBandcampDiscography, scrapeBandcampReleaseDate } from "./scrapers/bandcamp.js";
import { matchSpotifyRelease, classifyReleaseType } from "../lib/releaseMatching.js";
import { strapiGet, strapiPost } from "../lib/strapi.js";
import { splitArtistString, loadArtistCache, ensureArtist } from "../lib/artists.js";
import { normalizeReleases } from "../models/release.js";
import { setDiscography } from "../lib/bandcampCache.js";
import { logger } from "../lib/logger.js";

const RELEASES_PATH = "/api/dome-of-doom-releases";
const PAGE_SIZE = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllReleaseEntries(params = {}) {
  const all = [];
  let page = 1;

  while (true) {
    const res = await strapiGet(RELEASES_PATH, {
      ...params,
      "pagination[page]": page,
      "pagination[pageSize]": PAGE_SIZE,
    }, { noCache: true });

    all.push(...res.data);

    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }

  return all;
}

async function getExistingBandcampUrls() {
  const entries = await fetchAllReleaseEntries({ "fields[0]": "bandcamp_url" });
  return new Set(entries.map((e) => (e.bandcamp_url ?? e.attributes?.bandcamp_url)).filter(Boolean));
}

async function processNewRelease(release, artistCache) {
  const match = await matchSpotifyRelease(release);
  const type = classifyReleaseType({
    release_name: release.release_name,
    spotifyAlbumType: match?.album_type,
    totalTracks: match?.total_tracks,
  });

  let releaseDate = null;
  try {
    releaseDate = await scrapeBandcampReleaseDate(release.bandcamp_url);
  } catch (err) {
    logger.warn(`[syncDiscography] could not scrape release date for "${release.release_name}": ${err.message}`);
  }
  if (!releaseDate && match?.release_date) {
    releaseDate = new Date(match.release_date).toISOString();
  }

  // Bandcamp artist text can list multiple artists (e.g. "DMVU & FINNOH",
  // "ZOF, DMVU, Babyweight") — split and link each to the Artists relation.
  const artistNames = splitArtistString(release.artist);
  const artistDocIds = [];
  for (const name of artistNames) {
    const docId = await ensureArtist(artistCache, name);
    if (docId) artistDocIds.push(docId);
  }

  await strapiPost(RELEASES_PATH, {
    data: {
      name: release.release_name,
      artists: artistDocIds,
      type,
      spotify_url: match?.spotify_url ?? null,
      bandcamp_url: release.bandcamp_url,
      release_date: releaseDate,
      bandcamp_artwork_url: release.cover_art_src,
    },
  });

  logger.info(
    `[syncDiscography] added "${release.release_name}" by ${release.artist} ` +
    `(${type}${match ? ", matched" : ", no spotify match"})`
  );
}

export async function syncDiscography() {
  logger.info("[syncDiscography] starting sync...");

  const [scraped, existingUrls] = await Promise.all([
    scrapeBandcampDiscography(),
    getExistingBandcampUrls(),
  ]);

  const newReleases = scraped.filter((r) => r.bandcamp_url && !existingUrls.has(r.bandcamp_url));

  if (newReleases.length === 0) {
    logger.info("[syncDiscography] no new releases");
  } else {
    logger.info(`[syncDiscography] ${newReleases.length} new release(s) to process`);

    const artistCache = await loadArtistCache();

    for (const release of newReleases) {
      try {
        await processNewRelease(release, artistCache);
      } catch (err) {
        logger.error(`[syncDiscography] failed to process "${release.release_name}":`, err.message);
      }
      await sleep(250); // pace Spotify search + Strapi writes
    }
  }

  const allEntries = await fetchAllReleaseEntries({
    "populate[artists][fields][0]": "name",
  });
  const releases = normalizeReleases(allEntries);
  setDiscography(releases);

  logger.info(`[syncDiscography] sync complete, ${releases.length} releases in cache`);
}
