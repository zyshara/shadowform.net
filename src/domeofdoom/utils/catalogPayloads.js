import { selectHomeReleases } from "./homeReleases";

// Keep listing payloads independent of the full release detail model.
export function catalogSummary(item) {
  const { uid, title, artwork_url, type, label_role, catalog_number, artists, formats, release_date } = item;
  return { uid, title, artwork_url, type, label_role, catalog_number, artists, formats, release_date };
}

function homeSummary(item) {
  if (!item) return null;
  const { description, bandcamp_url, spotify_url } = item;
  return { ...catalogSummary(item), description, bandcamp_url, spotify_url };
}

export function homeContent(items, now) {
  const compilation = items.filter(item => item.type === "Compilation")
    .sort((a, b) => new Date(b.release_date ?? 0) - new Date(a.release_date ?? 0))[0];
  return {
    cards: selectHomeReleases(items, now).map(card => ({ ...card, item: homeSummary(card.item) })),
    latestCompilation: homeSummary(compilation),
    now,
  };
}
