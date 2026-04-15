// server/models/engineering.js

import { normalizeHeader, richTextToHtml, richTextToString } from "./header.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeMediaUrl(media) {
  const m = media?.data?.attributes ?? media?.attributes ?? media;
  return m?.url ?? null;
}

function normalizeTags(relation) {
  const items = Array.isArray(relation) ? relation : (relation?.data ?? []);
  return items
    .map(item => {
      const a = item?.attributes ?? item;
      return { label: a?.label ?? "", theme: a?.theme ?? null };
    })
    .filter(t => t.label);
}

// ── Project normalizer ────────────────────────────────────────────────────────

function normalizeProject(entry) {
  const e      = entry?.attributes ?? entry;
  const header = e?.header;

  return {
    id:          e?.slug ?? String(entry?.id ?? ""),
    eyebrow:     header?.eyebrow ?? null,
    title:       header?.heading ?? "",
    description: Array.isArray(header?.description)
      ? richTextToString(header.description)
      : (header?.description ?? ""),
    year:        e?.year     ?? null,
    link:        e?.url      ?? null,
    thumbnail:   normalizeMediaUrl(e?.thumbnail),
    icon:        normalizeMediaUrl(e?.badge),   // badge media → icon; null shows ✿
    topTags:     normalizeTags(e?.top_tags),    // { label, theme }[]
    tags:        normalizeTags(e?.bottom_tags), // { label, theme }[]
  };
}

// ── Page normalizer ───────────────────────────────────────────────────────────

export function normalizeEngineeringPage(entry) {
  const e   = entry?.attributes ?? entry;
  const raw = e?.header;

  return {
    header: raw ? {
      ...normalizeHeader(raw),
      description: Array.isArray(raw.description)
        ? richTextToHtml(raw.description)
        : (raw.description ?? ""),
    } : null,
    projects: (e?.projects ?? []).map(normalizeProject),
  };
}
