import { parseSpotifyArtistId } from "../../api/spotify.js";

export async function scrapeSpotifyMonthlyListeners(artist) {
  const artistId = parseSpotifyArtistId(artist.spotify?.url);
  if (!artistId) {
    console.warn(`[spotify-monthly] no artist ID for ${artist.name}, skipping`);
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
    console.warn(`[spotify-monthly] could not find initialState for ${artist.name}`);
    return null;
  }

  try {
    const json = JSON.parse(Buffer.from(match[1], "base64").toString("utf-8"));
    const artistData = Object.values(json?.entities?.items ?? {})[0];
    const monthlyListeners = artistData?.stats?.monthlyListeners;

    if (!monthlyListeners) {
      console.warn(`[spotify-monthly] could not find monthlyListeners for ${artist.name}`);
      return null;
    }

    const spotify_monthly_listeners = parseInt(monthlyListeners, 10);
    console.log(`[spotify-monthly] ${artist.name}: ${spotify_monthly_listeners} monthly listeners`);
    return { spotify_monthly_listeners };

  } catch (err) {
    console.warn(`[spotify-monthly] parse failed for ${artist.name}:`, err.message);
    return null;
  }
}
