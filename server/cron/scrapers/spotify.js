import { spotifyGet, parseSpotifyArtistId } from "../../api/spotify.js";

export async function scrapeSpotifyStats(artist) {
  const artistId = parseSpotifyArtistId(artist.spotify?.url);
  if (!artistId) {
    console.warn(`[spotify] no artist ID for ${artist.name}, skipping`);
    return null;
  }

  // Total releases
  let releases = [];
  let offset   = 0;
  const limit  = 50;

  while (true) {
    const data = await spotifyGet(
      `/artists/${artistId}/albums?include_groups=album,single&limit=${limit}&offset=${offset}`
    );
    releases = releases.concat(data.items);
    if (data.items.length < limit) break;
    offset += limit;
  }

  const total_releases = releases.length;

  console.log(`[spotify] ${artist.name}: ${total_releases} releases`);

  return { total_releases };
}
