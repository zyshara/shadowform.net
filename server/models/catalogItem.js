// server/models/catalogItem.js

const TYPE_LABELS = {
  album: "Album",
  ep: "EP",
  single: "Single",
  compilation: "Compilation",
  sample_pack: "Sample Pack",
};

// Strapi's "blocks" rich-text field is an array of block nodes - flatten to
// plain text for now (Catalog.jsx doesn't render rich formatting yet).
function blocksToText(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  const text = blocks
    .map((block) => (block.children || []).map((c) => c.text || "").join(""))
    .join("\n\n")
    .trim();
  return text || null;
}

function resolveMediaUrl(media) {
  const url = media?.url;
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  const base = process.env.STRAPI_API_URL || "https://strapi-shadowform-52c53315c615.herokuapp.com";
  return `${base}${url}`;
}

/**
 * Maps a raw Strapi dome-of-doom-catalog-item entry -> the shape the
 * client expects. Applies the override ?? derived fallback on every field
 * that has both - overrides is the human-confirmed value, derived is the
 * sync-computed suggestion (see conversation history for the full Layer
 * 2/3 design). Compatible with both Strapi v4 (entry.attributes) and v5
 * (flat entry), matching the other normalizers in this directory.
 */
export function normalizeCatalogItem(raw) {
  const r = raw?.attributes ?? raw;
  if (!r) return null;

  const derived = r.derived ?? {};
  const overrides = r.overrides ?? {};

  const title = overrides.title || derived.title || null;
  if (!title) return null;

  const rawType = overrides.type || derived.suggested_type || null;
  const artworkUrl = resolveMediaUrl(overrides.primary_image) || derived.artwork_url || null;
  const description = blocksToText(overrides.description) || derived.description || null;
  const labelRole = overrides.label_role || derived.label_role || null;
  const catalogNumber = overrides.catalog_number || null;

  const artists = (derived.artists ?? []).map((a) => a.name ?? a.attributes?.name).filter(Boolean);
  const formats = (derived.formats ?? []).map((f) => f.name ?? f.attributes?.name).filter(Boolean);

  return {
    uid: raw.documentId ?? raw.id,
    bandcamp_url: r.bandcamp_url ?? null,
    title,
    description,
    artwork_url: artworkUrl,
    type: TYPE_LABELS[rawType] ?? rawType,
    label_role: labelRole,
    catalog_number: catalogNumber,
    artists,
    formats,
    release_date: derived.release_date ?? null,
    publish_date: derived.publish_date ?? null,
  };
}

export function normalizeCatalogItems(list = []) {
  return list.map(normalizeCatalogItem).filter(Boolean);
}
