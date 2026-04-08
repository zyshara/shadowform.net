import { spotifyGet, parseSpotifyArtistId } from "../../lib/spotify.js";

export async function scrapeSpotifyStats(artist) {
  const artistId = parseSpotifyArtistId(artist.spotify?.url);
  if (!artistId) {
    console.warn(`[spotify] no artist ID for ${artist.name}, skipping`);
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

  console.log(`[spotify] ${artist.name}: ${total_releases} releases`);

  return { total_releases };
}
