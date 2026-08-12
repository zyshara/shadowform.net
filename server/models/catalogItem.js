// server/models/catalogItem.js

const TYPE_LABELS = {
  album: "Album",
  ep: "EP",
  single: "Single",
  compilation: "Compilation",
  sample_pack: "Sample Pack",
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Strapi's "blocks" rich-text field is an array of block nodes (paragraph/
// heading/list/quote/code, with inline bold/italic/underline/strikethrough/
// link marks on text children) - rendered to real HTML so the client can
// dangerouslySetInnerHTML it, rather than flattened to plain text.
function renderInlineChildren(children) {
  return (children || [])
    .map((child) => {
      if (child.type === "link") {
        const href = escapeHtml(child.url ?? "#");
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${renderInlineChildren(child.children)}</a>`;
      }
      let text = escapeHtml(child.text ?? "");
      if (child.code) text = `<code>${text}</code>`;
      if (child.bold) text = `<strong>${text}</strong>`;
      if (child.italic) text = `<em>${text}</em>`;
      if (child.underline) text = `<u>${text}</u>`;
      if (child.strikethrough) text = `<s>${text}</s>`;
      return text;
    })
    .join("");
}

const HEADING_TAGS = { 1: "h1", 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" };

function renderBlock(block) {
  switch (block.type) {
    case "heading": {
      const tag = HEADING_TAGS[block.level] ?? "h3";
      return `<${tag}>${renderInlineChildren(block.children)}</${tag}>`;
    }
    case "list": {
      const tag = block.format === "ordered" ? "ol" : "ul";
      const items = (block.children || [])
        .map((item) => `<li>${renderInlineChildren(item.children)}</li>`)
        .join("");
      return `<${tag}>${items}</${tag}>`;
    }
    case "quote":
      return `<blockquote>${renderInlineChildren(block.children)}</blockquote>`;
    case "code":
      return `<pre><code>${escapeHtml((block.children || []).map((c) => c.text || "").join(""))}</code></pre>`;
    case "paragraph":
    default:
      return `<p>${renderInlineChildren(block.children)}</p>`;
  }
}

function blocksToHtml(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  const html = blocks.map(renderBlock).join("").trim();
  return html || null;
}

// derived.description is plain text scraped from Bandcamp, not Strapi
// blocks - wrapped in <p> tags (blank-line-separated paragraphs, single
// newlines as <br/>) so item.description is *always* ready-to-render HTML
// regardless of which layer it came from, never a mix of raw HTML and
// plain text the client would need to handle differently.
function plainTextToHtml(text) {
  if (!text) return null;
  const html = text
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return html || null;
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
  const description = blocksToHtml(overrides.description) || plainTextToHtml(derived.description) || null;
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
