import { spotifyGet, parseSpotifyArtistId } from "../../lib/spotify.js";
import { logger } from "../../lib/logger.js";

export async function scrapeSpotifyStats(artist) {
  const artistId = parseSpotifyArtistId(artist.spotify?.url);
  if (!artistId) {
    logger.warn(`[spotify] ${artist.name}: no artist ID, skipping`);
    return null;
  }

  // Total releases
  let releases = [];
  let offset   = 0;

  const limit = 10;

  while (true) {
    const data = await spotifyGet(
      `/artists/${artistId}/albums?limit=${limit}&offset=${offset}`
    );
    releases = releases.concat(data.items);
    if (data.items.length < limit) break;
    offset += limit;
    if (offset > 500) break;
  }

  const total_releases = releases.length;

  logger.info(`[spotify] ${artist.name}: ${total_releases} releases`);

  return { total_releases };
}

export async function scrapeSpotifyMonthlyListeners(artist) {
  const artistId = parseSpotifyArtistId(artist.spotify?.url);
  if (!artistId) {
    logger.warn(`[spotify-monthly] ${artist.name}: no artist ID, skipping`);
    return null;
  }

  const res = await fetch(`https://open.spotify.com/artist/${artistId}`, {
    headers: {
      // curl's default UA gets the mobile player which has initialState embedded
      "User-Agent": "curl/7.88.1",
      "Accept": "*/*",
    },
  });

  if (!res.ok) throw new Error(`Spotify page fetch failed: ${res.status}`);

  const html = await res.text();

  const match = html.match(/<script id="initialState" type="text\/plain">([^<]+)<\/script>/);
  if (!match) {
    logger.warn(`[spotify-monthly] ${artist.name}: could not find initialState`);
    return null;
  }

  try {
    const json = JSON.parse(Buffer.from(match[1], "base64").toString("utf-8"));
    const artistData = Object.values(json?.entities?.items ?? {})[0];
    const monthlyListeners = artistData?.stats?.monthlyListeners;

    if (!monthlyListeners) {
      logger.warn(`[spotify-monthly] ${artist.name}: could not find monthlyListeners`);
      return null;
    }

    const spotify_monthly_listeners = parseInt(monthlyListeners, 10);
    logger.info(`[spotify-monthly] ${artist.name}: ${spotify_monthly_listeners} monthly listeners`);
    return { spotify_monthly_listeners };

  } catch (err) {
    logger.warn(`[spotify-monthly] ${artist.name}: parse failed:`, err.message);
    return null;
  }
}
