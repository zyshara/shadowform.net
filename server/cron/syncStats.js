import { getArtists } from "../api/artists.js";
import { scrapeSpotifyStats, scrapeSpotifyMonthlyListeners } from "./scrapers/spotify.js";
import { scrapeInstagramFollowers } from "./scrapers/instagram.js";
import { scrapeSongkickShows } from "./scrapers/songkick.js";
import { logger } from "../lib/logger.js";

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

    const [instagram, songkick] = await Promise.allSettled([
      scrapeInstagramFollowers(artist),
      scrapeSongkickShows(artist),
    ]);

    logger.debug(`[syncStats] ${artist.name}: monthly result:`, monthly);
    logger.debug(`[syncStats] ${artist.name}: spotifyStats result:`, spotifyStats);

    const stats = {
      ...(monthly      ? monthly      : {}),
      ...(spotifyStats ? spotifyStats : {}),
      ...(instagram.status === "fulfilled" && instagram.value ? instagram.value : {}),
      ...(songkick.status  === "fulfilled" && songkick.value  ? songkick.value  : {}),
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
