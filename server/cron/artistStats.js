// server/cron/artistStats.js
//
// For every artist on the generic /api/artists content type, scrapes fresh
// Spotify/Instagram/Bandsintown stats and writes them to Strapi's
// artist-statistics content type. Runs as part of the twice-daily batch.

import { getAllArtists } from "#lib/artists.js";
import { scrapeSpotifyStats, scrapeSpotifyMonthlyListeners } from "#cron/scrapers/spotify.js";
import { scrapeInstagramFollowers } from "#cron/scrapers/instagram.js";
import { scrapeBandsintownShows } from "#cron/scrapers/bandsintown.js";
import { createLogger } from "#lib/logger.js";
const log = createLogger("artistStats");

import { strapiPut } from "#lib/strapi.js";

export async function syncAllArtistStats() {
  log.info("syncAllArtistStats", "starting sync...");

  const artists = await getAllArtists();

  for (const artist of artists) {
    const statsDocumentId = artist.artist_statistics?.documentId;
    if (!statsDocumentId) {
      log.warn("syncAllArtistStats", `${artist.name}: no artist_statistics relation, skipping`);
      continue;
    }

    log.info("syncAllArtistStats", `${artist.name}: syncing...`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const monthly      = await scrapeSpotifyMonthlyListeners(artist).catch(e => null);
    const spotifyStats = await scrapeSpotifyStats(artist).catch(e => {
      log.error("syncAllArtistStats", `${artist.name}: spotifyStats error:`, e);
      return null;
    });

    const [instagram, bandsintown] = await Promise.allSettled([
      scrapeInstagramFollowers(artist),
      scrapeBandsintownShows(artist),
    ]);

    const stats = {
      ...(monthly      ? monthly      : {}),
      ...(spotifyStats ? spotifyStats : {}),
      ...(instagram.status   === "fulfilled" && instagram.value   ? instagram.value   : {}),
      ...(bandsintown.status === "fulfilled" && bandsintown.value ? bandsintown.value : {}),
    };

    if (!Object.keys(stats).length) {
      log.warn("syncAllArtistStats", `${artist.name}: no stats collected, skipping PUT`);
      continue;
    }

    try {
      await strapiPut(`/api/artist-statistics/${statsDocumentId}`, { data: stats });
      log.info("syncAllArtistStats", `${artist.name}: updated:`, stats);
    } catch (err) {
      log.error("syncAllArtistStats", `${artist.name}: update failed:`, err);
    }
  }

  log.info("syncAllArtistStats", "sync complete");
}
