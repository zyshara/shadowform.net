// server/apps/domeofdoom/cron/syncStats.js
//
// For every artist on the generic /api/artists content type, scrapes fresh
// Spotify/Instagram/Bandsintown stats and writes them to Strapi's
// artist-statistics content type. Runs as part of the twice-daily batch.

import { getArtists } from "#apps/domeofdoom/strapiArtists.js";
import { scrapeSpotifyStats, scrapeSpotifyMonthlyListeners } from "#apps/domeofdoom/scrapers/spotify.js";
import { scrapeInstagramFollowers } from "#apps/domeofdoom/scrapers/instagram.js";
import { scrapeBandsintownShows } from "#apps/domeofdoom/scrapers/bandsintown.js";
import { logger } from "#lib/logger.js";

const STRAPI_URL   = process.env.STRAPI_API_URL  || "https://strapi-shadowform-52c53315c615.herokuapp.com";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

async function updateArtistStats(documentId, stats) {
  const res = await fetch(`${STRAPI_URL}/api/artist-statistics/${documentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({ data: stats }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Strapi PUT failed: ${res.status} ${body}`);
  }

  return res.json();
}

export async function syncAllArtistStats() {
  logger.info("[syncStats] starting sync...");

  const data    = await getArtists();
  const artists = data.data ?? [];

  for (const artist of artists) {
    const statsDocumentId = artist.artist_statistics?.documentId;
    if (!statsDocumentId) {
      logger.warn(`[syncStats] ${artist.name}: no artist_statistics relation, skipping`);
      continue;
    }

    logger.info(`[syncStats] ${artist.name}: syncing...`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const monthly      = await scrapeSpotifyMonthlyListeners(artist).catch(e => null);
    const spotifyStats = await scrapeSpotifyStats(artist).catch(e => {
      logger.error(`[syncStats] ${artist.name}: spotifyStats error:`, e.message);
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
      logger.warn(`[syncStats] ${artist.name}: no stats collected, skipping PUT`);
      continue;
    }

    try {
      await updateArtistStats(statsDocumentId, stats);
      logger.info(`[syncStats] ${artist.name}: updated:`, stats);
    } catch (err) {
      logger.error(`[syncStats] ${artist.name}: update failed:`, err.message);
    }
  }

  logger.info("[syncStats] sync complete");
}
