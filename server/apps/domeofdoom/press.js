// server/apps/domeofdoom/press.js
import { strapiGetAllPages } from "#lib/strapi.js";
import { cdnImg } from "#lib/cloudinary.js";

function blocksToText(blocks) {
  if (!Array.isArray(blocks)) return null;
  const text = blocks
    .flatMap((block) => block.children ?? [])
    .filter((child) => child.type === "text")
    .map((child) => child.text)
    .join("")
    .trim();
  return text || null;
}

function normalizeOutlet(outlet) {
  if (!outlet) return null;
  return {
    name:    outlet.name ?? null,
    website: outlet.website ?? null,
    logo:    outlet.logo?.url ?? null,
  };
}

function normalizeItem(item) {
  return {
    id:        item.documentId,
    title:     item.title ?? null,
    date:      item.date ?? null,
    url:       item.url ?? null,
    excerpt:   blocksToText(item.summary),
    ogImage:   cdnImg(item.ogImage ?? null, 400),
    imageMode: item.imageMode ?? "og",
    thumbnail: cdnImg(item.thumbnail?.url ?? null, 400),
    outlet:    normalizeOutlet(item.outlet),
  };
}

async function getPressItems() {
  return strapiGetAllPages("/api/dome-of-doom-press-items", {
    "populate[outlet][populate]": "*",
    "populate[thumbnail]":        "true",
    "sort": "date:desc",
  });
}

export async function getPress() {
  const response = await getPressItems();
  return response.map(normalizeItem);
}
