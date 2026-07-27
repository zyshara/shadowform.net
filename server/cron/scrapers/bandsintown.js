import { logger } from "../../lib/logger.js";

export async function scrapeBandsintownShows(artist) {
  const envKey = `BANDSINTOWN_API_KEY_${artist.slug.toUpperCase().replace(/-/g, "_")}`;
  const appId = process.env[envKey];

  if (!appId) {
    logger.warn(`[bandsintown] ${artist.name}: no API key (looked for ${envKey}), skipping`);
    return null;
  }

  const encodedName = encodeURIComponent(artist.name);

  const [upcomingRes, pastRes] = await Promise.all([
    fetch(`https://rest.bandsintown.com/artists/${encodedName}/events?app_id=${appId}&date=upcoming`),
    fetch(`https://rest.bandsintown.com/artists/${encodedName}/events?app_id=${appId}&date=past`),
  ]);

  if (!upcomingRes.ok) throw new Error(`Bandsintown upcoming events fetch failed: ${upcomingRes.status}`);
  if (!pastRes.ok) throw new Error(`Bandsintown past events fetch failed: ${pastRes.status}`);

  const upcoming = await upcomingRes.json();
  const past     = await pastRes.json();

  const upcoming_shows = Array.isArray(upcoming) ? upcoming.length : 0;
  const shows_played   = Array.isArray(past) ? past.length : 0;

  logger.info(`[bandsintown] ${artist.name}: ${shows_played} past, ${upcoming_shows} upcoming`);

  return { shows_played, upcoming_shows };
}
