// server/models/epk.js

import { normalizeArtist } from "./artist.js";

function normalizeFeaturedTrack(raw) {
  if (!raw) return null;
  return {
    title:        raw.name         ?? "",
    label:        raw.label        ?? "",
    year:         raw.year         ?? "",
    file_url:     raw.file?.url    ?? null,
    download_url: raw.download     ?? null,
  };
}

function normalizePhotoMedia(raw) {
  if (!raw) return null;
  return {
    name:          raw.name              ?? "",
    thumbnail_url: raw.thumbnail?.url    ?? null,
    file_url:      raw.file?.url         ?? null,
  };
}

function normalizePress(raw) {
  if (!raw) return null;
  return {
    quote:  raw.caption ?? "",
    source: raw.source  ?? "",
    url:    raw.url     ?? null,
  };
}


export function normalizeEpk(entry) {
  const e = entry.attributes ?? entry;

  return {
    artist:           normalizeArtist(e.artist),
    featured_tracks:  (e.featured_tracks  ?? []).map(normalizeFeaturedTrack).filter(Boolean),
    photos_and_media: (e.photos_and_media ?? []).map(normalizePhotoMedia).filter(Boolean),
    press:            (e.press            ?? []).map(normalizePress).filter(Boolean),
    links:           [],
  };
}
