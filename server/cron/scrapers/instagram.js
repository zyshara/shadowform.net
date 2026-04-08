import { logger } from "../../lib/logger.js";

export function parseInstagramHandle(url) {
  // https://www.instagram.com/lowpolysound/
  const match = url.match(/instagram\.com\/([^/?]+)/);
  return match ? match[1] : null;
}

export async function scrapeInstagramFollowers(artist) {
  const envKey = `INSTAGRAM_TOKEN_${artist.slug.toUpperCase().replace(/-/g, "_")}`;
  const token = process.env[envKey];

  if (!token) {
    logger.warn(`[instagram] ${artist.name}: no token (looked for ${envKey}), skipping`);
    return null;
  }

  const res = await fetch(
    `https://graph.instagram.com/me?fields=followers_count&access_token=${token}`
  );

  if (!res.ok) throw new Error(`Instagram API failed: ${res.status}`);

  const data = await res.json();

  if (!data.followers_count) {
    logger.warn(`[instagram] ${artist.name}: no followers_count`);
    return null;
  }

  logger.info(`[instagram] ${artist.name}: ${data.followers_count} followers`);
  return { instagram_followers: data.followers_count };
}
