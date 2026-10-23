// server/cron/scrapers/instagram.js
//
// Fetches one artist's Instagram follower count via the Graph API, keyed by
// a per-artist INSTAGRAM_TOKEN_<SLUG> env var. Unrelated to
// server/automation/instagram.js, which refreshes redspear/low-poly's own
// embed tokens — different concern, different tenants, same env-var naming
// convention.

import { createLogger } from "#lib/logger.js";
const log = createLogger("instagram");

export async function scrapeInstagramFollowers(artist) {
  const envKey = `INSTAGRAM_TOKEN_${artist.slug.toUpperCase().replace(/-/g, "_")}`;
  const token = process.env[envKey];

  if (!token) {
    log.warn("scrapeInstagramFollowers", `${artist.name}: no token (looked for ${envKey}), skipping`);
    return null;
  }

  const res = await fetch(
    `https://graph.instagram.com/me?fields=followers_count&access_token=${token}`
  );

  if (!res.ok) throw new Error(`Instagram API failed: ${res.status}`);

  const data = await res.json();

  if (!data.followers_count) {
    log.warn("scrapeInstagramFollowers", `${artist.name}: no followers_count`);
    return null;
  }

  log.info("scrapeInstagramFollowers", `${artist.name}: ${data.followers_count} followers`);
  return { instagram_followers: data.followers_count };
}
