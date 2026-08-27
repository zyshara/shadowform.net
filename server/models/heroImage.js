export function normalizeHeroImage(raw) {
  return {
    id:        raw.id,
    slug:      raw.slug      ?? null,
    name:      raw.name      ?? null,
    year:      raw.year      ?? null,
    artists:   raw.artists   ?? null,
    image_url: raw.image?.url ?? null,
  };
}

export function normalizeHeroImages(rawList) {
  return rawList.map(normalizeHeroImage);
}
