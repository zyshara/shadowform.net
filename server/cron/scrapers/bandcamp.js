import { logger } from "../../lib/logger.js";
import { decodeHtmlEntities } from "./htmlEntities.js";

const MUSIC_PAGE_URL = "https://domeofdoom.bandcamp.com/music";

function coverArtUrl(artId) {
  return `https://f4.bcbits.com/img/a${String(artId).padStart(10, "0")}_10.jpg`;
}

function normalizeUrl(url) {
  if (!url) return null;
  const absolute = url.startsWith("http") ? url : `https://domeofdoom.bandcamp.com${url}`;
  return absolute.split("?")[0];
}

// Bandcamp only server-renders the first ~16 releases as <li class="music-grid-item">
// inside <ol id="music-grid"> — the rest of the catalog (157 more releases here) ships
// in that same tag's data-client-items attribute, a JSON blob Bandcamp's own JS
// hydrates into the grid on page load (not scroll-triggered pagination — confirmed by
// scrolling to the bottom of the live page and seeing the DOM count never grow past
// the union of these two sources). Both are present in one plain HTML response, so no
// headless browser is needed — just parse both and merge, keyed by "type-id" so
// nothing is double-counted if Bandcamp ever overlaps them.
export async function scrapeBandcampDiscography() {
  const res = await fetch(MUSIC_PAGE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; shadowform-bot/1.0)" },
  });

  if (!res.ok) throw new Error(`Bandcamp music page fetch failed: ${res.status}`);

  const html = await res.text();

  const grid = html.match(/<ol id="music-grid"[\s\S]*?<\/ol>/)?.[0];
  if (!grid) {
    logger.warn("[bandcamp] domeofdoom: could not find music grid");
    return [];
  }

  const releases = new Map();

  const items = grid.match(/<li[^>]*class="music-grid-item[\s\S]*?<\/li>/g) ?? [];
  for (const item of items) {
    const itemId = item.match(/data-item-id="([^"]+)"/)?.[1];
    const title  = item.match(/<p class="title">\s*([^<]+)/)?.[1]?.trim();
    if (!title) continue;

    const artist = item.match(/<span class="artist-override">\s*([^<]+?)\s*<\/span>/)?.[1]?.trim();
    const cover_art_src = (item.match(/data-original="([^"]+)"/)?.[1]
      ?? item.match(/<img[^>]*\ssrc="([^"]+)"/)?.[1]
      ?? null)?.replace(/_\d+\.jpg$/i, "_10.jpg") ?? null;
    const bandcamp_url = normalizeUrl(item.match(/<a href="([^"]+)"/)?.[1]);

    releases.set(itemId ?? title, {
      artist: artist ? decodeHtmlEntities(artist) : null,
      release_name: decodeHtmlEntities(title),
      cover_art_src,
      bandcamp_url,
    });
  }

  const clientItemsRaw = grid.match(/data-client-items="([^"]*)"/)?.[1];
  if (clientItemsRaw) {
    const clientItems = JSON.parse(decodeHtmlEntities(clientItemsRaw));
    for (const it of clientItems) {
      const itemId = `${it.type}-${it.id}`;
      if (releases.has(itemId)) continue;

      releases.set(itemId, {
        artist: it.artist ?? null,
        release_name: it.title ?? null,
        cover_art_src: it.art_id ? coverArtUrl(it.art_id) : null,
        bandcamp_url: normalizeUrl(it.page_url),
      });
    }
  }

  const result = [...releases.values()];

  logger.info(`[bandcamp] domeofdoom: found ${result.length} releases`);

  return result;
}

// Scrapes the full release date (not just year) off an individual release
// page. Primary source is the JSON-LD "datePublished" field, which Bandcamp
// renders as a full timestamp e.g. "20 Sep 2024 04:14:47 GMT". Falls back to
// the human-readable "released September 20, 2024" text if that's missing.
export async function scrapeBandcampReleaseDate(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; shadowform-bot/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const published = html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1];
  if (published) {
    const d = new Date(published);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  const relText = html.match(/released\s+([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2} [A-Za-z]+ \d{4})/i)?.[1];
  if (relText) {
    const d = new Date(relText);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  return null;
}
