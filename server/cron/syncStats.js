import { getArtists } from "../api/strapi.js";
import { scrapeSpotifyStats } from "./scrapers/spotify.js";
import { scrapeSpotifyMonthlyListeners } from "./scrapers/spotifyMonthly.js";
import { scrapeInstagramFollowers } from "./scrapers/instagram.js";
import { scrapeSongkickShows } from "./scrapers/songkick.js";

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
  console.log("[syncStats] starting sync...");

  const data    = await getArtists();
  const artists = data.data ?? [];

  for (const artist of artists) {
    const statsDocumentId = artist.artist_statistics?.documentId;
    if (!statsDocumentId) {
      console.warn(`[syncStats] no artist_statistics relation for ${artist.name}, skipping`);
      continue;
    }

    console.log(`[syncStats] syncing ${artist.name}...`);

    const [spotify, monthly, instagram, songkick] = await Promise.allSettled([
      scrapeSpotifyStats(artist),
      scrapeSpotifyMonthlyListeners(artist),
      scrapeInstagramFollowers(artist),
      scrapeSongkickShows(artist),
    ]);

    const stats = {
      ...(spotify.status   === "fulfilled" && spotify.value   ? spotify.value   : {}),
      ...(monthly.status   === "fulfilled" && monthly.value   ? monthly.value   : {}),
      ...(instagram.status === "fulfilled" && instagram.value ? instagram.value : {}),
      ...(songkick.status  === "fulfilled" && songkick.value  ? songkick.value  : {}),
    };

    if (!Object.keys(stats).length) {
      console.warn(`[syncStats] no stats collected for ${artist.name}, skipping PUT`);
      continue;
    }

    try {
      await updateArtistStats(statsDocumentId, stats);
      console.log(`[syncStats] updated ${artist.name}:`, stats);
    } catch (err) {
      console.error(`[syncStats] failed to update ${artist.name}:`, err.message);
    }
  }

  console.log("[syncStats] sync complete");
}
