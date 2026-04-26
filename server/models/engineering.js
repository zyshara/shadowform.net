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

// ── Project normalizer (legacy projects / archive fields) ─────────────────────

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
    icon:        normalizeMediaUrl(e?.badge),
    topTags:     normalizeTags(e?.top_tags),
    tags:        normalizeTags(e?.bottom_tags),
  };
}

// ── archive_v2 dynamic zone normalizers ───────────────────────────────────────

// Normalizes the card component inside an EngineeringWebArchiveProject entry.
// previewSrc is derived from the slug — no Strapi field needed.
function normalizeArchiveV2Card(card, { forDetail = false } = {}) {
  if (!card) return null;
  const header = card?.header;
  const slug   = card?.slug ?? null;

  return {
    id:          slug,
    eyebrow:     header?.eyebrow     ?? null,
    title:       header?.heading     ?? "",
    description: Array.isArray(header?.description)
      ? richTextToString(header.description)
      : (header?.description ?? ""),
    year:        card?.year          ?? null,
    // archive list links to the detail page; detail page shows external url via previewSrc
    link:        forDetail ? (card?.url ?? null) : (slug ? `/engineering/archive/${slug}` : null),
    thumbnail:   normalizeMediaUrl(card?.thumbnail),
    icon:        normalizeMediaUrl(card?.badge),
    topTags:     normalizeTags(card?.top_tags),
    tags:        normalizeTags(card?.bottom_tags),
    ...(forDetail && slug ? { previewSrc: `/preserved/${slug}/index.html` } : {}),
  };
}

// Normalizes a single dynamic zone entry (any __component type we handle).
function normalizeArchiveV2Entry(entry, opts = {}) {
  // Each dynamic zone entry has a __component discriminator.
  // Currently we handle engineering-projects.engineering-web-archive-project.
  // Future component types can be dispatched here.
  return normalizeArchiveV2Card(entry?.card, opts);
}

export function normalizeArchiveV2List(entries = []) {
  return entries
    .map(e => normalizeArchiveV2Entry(e))
    .filter(Boolean);
}

// Normalizes a single Engineering Web Archive Project collection entry.
// The collection uses a capital "Header" component field name.
export function normalizeWebArchiveProject(entry) {
  if (!entry) return null;
  const e      = entry?.attributes ?? entry;
  const header = e?.Header ?? e?.header;   // Strapi returns "Header" with capital H
  const slug   = e?.slug ?? null;

  return {
    id:          slug,
    eyebrow:     header?.eyebrow     ?? null,
    title:       header?.heading     ?? "",
    description: Array.isArray(header?.description)
      ? richTextToString(header.description)
      : (header?.description ?? ""),
    year:        e?.year             ?? null,
    topTags:     normalizeTags(e?.top_tags),
    tags:        normalizeTags(e?.bottom_tags),
    thumbnail:   null,
    icon:        null,
    previewSrc:  slug ? `/preserved/${slug}/index.html` : null,
  };
}

// ── Page normalizer ───────────────────────────────────────────────────────────

function normalizePageHeader(e) {
  const raw = e?.header;
  return raw ? {
    ...normalizeHeader(raw),
    description: Array.isArray(raw.description)
      ? richTextToHtml(raw.description)
      : (raw.description ?? ""),
  } : null;
}

export function normalizeEngineeringPage(entry) {
  const e = entry?.attributes ?? entry;
  return {
    header:   normalizePageHeader(e),
    projects: (e?.projects ?? []).map(normalizeProject),
  };
}

export function normalizeEngineeringArchive(entry) {
  const e        = entry?.attributes ?? entry;
  const projects = (e?.projects   ?? []).map(normalizeProject);
  const archive  = normalizeArchiveV2List(e?.archive_v2 ?? []);
  return {
    header:  normalizePageHeader(e),
    entries: [...projects, ...archive],
  };
}
