import { logger } from "../../lib/logger.js";
import { decodeHtmlEntities } from "./htmlEntities.js";

const MERCH_PAGE_URL = "https://domeofdoom.bandcamp.com/merch";

function coverArtUrl(imgId) {
  return `https://f4.bcbits.com/img/${String(imgId).padStart(10, "0")}_10.jpg`;
}

function normalizeUrl(url) {
  if (!url) return null;
  const absolute = url.startsWith("http") ? url : `https://domeofdoom.bandcamp.com${url}`;
  return absolute.split("?")[0];
}

// Same two-source shape as the discography scrape (see bandcamp.js): Bandcamp
// only server-renders the first batch of <li class="merch-grid-item"> inside
// <ol id="merch-grid">, with the rest hydrated client-side from that tag's
// data-client-items JSON attribute. Both are in one plain HTML response.
export async function scrapeBandcampMerch() {
  const res = await fetch(MERCH_PAGE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; shadowform-bot/1.0)" },
  });

  if (!res.ok) throw new Error(`Bandcamp merch page fetch failed: ${res.status}`);

  const html = await res.text();

  const grid = html.match(/<ol id="merch-grid"[\s\S]*?<\/ol>/)?.[0];
  if (!grid) {
    logger.warn("[bandcamp] domeofdoom: could not find merch grid");
    return [];
  }

  const items = new Map();

  const domItems = grid.match(/<li[^>]*class="merch-grid-item[\s\S]*?<\/li>/g) ?? [];
  for (const item of domItems) {
    const itemId = item.match(/data-item-id="([^"]+)"/)?.[1];

    const titleBlock = item.match(/<p class="title">([\s\S]*?)<\/p>/)?.[1] ?? "";
    const itemName = titleBlock
      .split(/<br\s*\/?>/)[0]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!itemName) continue;

    const artist  = item.match(/<span class="artist-override">\s*([^<]+?)\s*<\/span>/)?.[1]?.trim();
    const merchType = item.match(/<div class="merchtype secondaryText">\s*([^<]*?)\s*<\/div>/)?.[1]?.trim();
    const soldOut = /<p class="price sold-out">/.test(item);
    const price   = item.match(/<span class="price">\$?([\d.,]+)<\/span>/)?.[1];
    const currency = item.match(/<span class="currency">\s*([^<]+?)\s*<\/span>/)?.[1]?.trim();
    const cover_art_src = (item.match(/data-original="([^"]+)"/)?.[1]
      ?? item.match(/<img[^>]*\ssrc="([^"]+)"/)?.[1]
      ?? null)?.replace(/_\d+\.jpg$/i, "_10.jpg") ?? null;
    const url = normalizeUrl(item.match(/<a href="([^"]+)"/)?.[1]);

    items.set(itemId ?? itemName, {
      artist: artist ? decodeHtmlEntities(artist) : null,
      item_name: decodeHtmlEntities(itemName),
      type: merchType || null,
      price: price ? Number(price) : null,
      currency: currency ?? null,
      sold_out: soldOut,
      cover_art_src,
      url,
    });
  }

  const clientItemsRaw = grid.match(/data-client-items="([^"]*)"/)?.[1];
  if (clientItemsRaw) {
    const clientItems = JSON.parse(decodeHtmlEntities(clientItemsRaw));
    for (const it of clientItems) {
      const itemId = String(it.id);
      if (items.has(itemId)) continue;

      items.set(itemId, {
        artist: it.album_artist ?? null,
        item_name: it.title ?? null,
        // type_id has no documented mapping beyond what we've observed
        // (1 = CD, 3 = cassette) — not reliable enough to guess from, so
        // items sourced from here go without a type rather than a wrong one.
        type: null,
        price: it.price ?? null,
        currency: it.currency ?? null,
        sold_out: it.sold_out ?? false,
        cover_art_src: it.img_id ? coverArtUrl(it.img_id) : null,
        url: normalizeUrl(it.url),
      });
    }
  }

  const result = [...items.values()];

  logger.info(`[bandcamp] domeofdoom: found ${result.length} merch items`);

  return result;
}
