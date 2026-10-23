export const normalize = (value = "") => value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export const withoutEpSuffix = (title = "") => title.replace(/(?:\s+[-–—:]?\s*EP|\s*\(EP\))$/i, "").trim();
export function isEp(item) {
  const title = item.overrides?.title || item.derived?.title || "";
  return (item.overrides?.type || item.derived?.suggested_type || "").toLowerCase() === "ep" || withoutEpSuffix(title) !== title;
}
export function spotifySearchTitle(item) {
  const title = item.overrides?.title || item.derived?.title || "";
  return isEp(item) ? withoutEpSuffix(title) : title;
}

export function exactCandidates(item, candidates) {
  const title = item.overrides?.title || item.derived?.title;
  const artist = item.derived?.artists?.[0]?.name;
  const year = item.derived?.release_date?.slice(0, 4);
  if (!title || !artist || !/^\d{4}$/.test(year || "")) return [];
  return [...new Map(candidates.filter((candidate) =>
    (normalize(candidate.name) === normalize(title) ||
      (isEp(item) && normalize(withoutEpSuffix(candidate.name)) === normalize(withoutEpSuffix(title)))) &&
    candidate.artists?.some((a) => normalize(a.name) === normalize(artist)) &&
    candidate.release_date?.slice(0, 4) === year
  ).map((candidate) => [candidate.id, candidate])).values()];
}

export function isDomeLabel(label) {
  return /^domeofdoom(?:records)?$/.test(normalize(label));
}

export function domeAttribution(album) {
  if (isDomeLabel(album.label)) return album.label;
  // Some Spotify responses omit label but retain copyright ownership.
  return album.copyrights?.find(({ text }) => isDomeLabel(text?.replace(/^\s*(?:©|℗|\(c\)|\(p\))?\s*\d{4}\s*/i, "")))?.text || null;
}
