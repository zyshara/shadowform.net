// server/cron/scrapers/spotify.js
//
// Computes one artist's total-release count and monthly-listener figure
// from the Spotify Web API, on top of the shared lib/spotify.js client.

import { spotifyGet, parseSpotifyArtistId } from "#lib/spotify.js";
import { createLogger } from "#lib/logger.js";
const log = createLogger("spotify");

export async function scrapeSpotifyStats(artist) {
  const artistId = parseSpotifyArtistId(artist.spotify?.url);
  if (!artistId) {
    log.warn("scrapeSpotifyStats", `${artist.name}: no artist ID, skipping`);
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

  log.info("scrapeSpotifyStats", `${artist.name}: ${total_releases} releases`);

  return { total_releases };
}

export async function scrapeSpotifyMonthlyListeners(artist) {
  const artistId = parseSpotifyArtistId(artist.spotify?.url);
  if (!artistId) {
    log.warn("scrapeSpotifyMonthlyListeners", `${artist.name}: no artist ID, skipping`);
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
    log.warn("scrapeSpotifyMonthlyListeners", `${artist.name}: could not find initialState`);
    return null;
  }

  try {
    const json = JSON.parse(Buffer.from(match[1], "base64").toString("utf-8"));
    const artistData = Object.values(json?.entities?.items ?? {})[0];
    const monthlyListeners = artistData?.stats?.monthlyListeners;

    if (!monthlyListeners) {
      log.warn("scrapeSpotifyMonthlyListeners", `${artist.name}: could not find monthlyListeners`);
      return null;
    }

    const spotify_monthly_listeners = parseInt(monthlyListeners, 10);
    log.info("scrapeSpotifyMonthlyListeners", `${artist.name}: ${spotify_monthly_listeners} monthly listeners`);
    return { spotify_monthly_listeners };

  } catch (err) {
    log.warn("scrapeSpotifyMonthlyListeners", `${artist.name}: parse failed:`, err);
    return null;
  }
}
