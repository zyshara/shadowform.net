import { logger } from "../../lib/logger.js";
import { decodeHtmlEntities } from "./htmlEntities.js";

const ARTISTS_PAGE_URL = "https://domeofdoom.bandcamp.com/artists";

// Unlike the music and merch grids, this one has no data-client-items to
// merge in — data-initial-values="null" on the grid, and scrolling the live
// page never grows the count past what's already in the plain HTML. So the
// full roster is just a straight parse of the server-rendered <li>s.
export async function scrapeBandcampRoster() {
  const res = await fetch(ARTISTS_PAGE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; shadowform-bot/1.0)" },
  });

  if (!res.ok) throw new Error(`Bandcamp artists page fetch failed: ${res.status}`);

  const html = await res.text();

  const grid = html.match(/<ol class='editable-grid artists-grid[\s\S]*?<\/ol>/)?.[0];
  if (!grid) {
    logger.warn("[bandcamp] domeofdoom: could not find artists grid");
    return [];
  }

  const items = grid.match(/<li class='artists-grid-item[\s\S]*?<\/li>/g) ?? [];

  const roster = items.map((item) => {
    const name = item.match(/<div class="artists-grid-name">\s*([^<]+?)\s*<\/div>/)?.[1]?.trim();
    if (!name) return null;

    const location = item.match(/<div class="artists-grid-location secondaryText">\s*([^<]*?)\s*<\/div>/)?.[1]?.trim();
    const url = item.match(/<a href='([^']+)'/)?.[1]?.split("?")[0];
    const photo_src = item.match(/data-original="([^"]+)"/)?.[1]
      ?? item.match(/<img[^>]*\ssrc="([^"]+)"/)?.[1]
      ?? null;

    return {
      name: decodeHtmlEntities(name),
      location: location ? decodeHtmlEntities(location) : null,
      photo_src,
      url: url ?? null,
    };
  }).filter(Boolean);

  logger.info(`[bandcamp] domeofdoom: found ${roster.length} artists`);

  return roster;
}
