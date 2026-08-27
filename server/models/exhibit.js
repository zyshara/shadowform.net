// server/models/exhibit.js

function normalizeExhibit(raw) {
  const museum = raw.museum ?? null;

  return {
    id: raw.id,
    title: raw.title ?? "",
    museum_id: museum?.id ?? null,
    museum_slug: museum?.slug ?? null,
    museum_name: museum?.name ?? "",
    description: raw.description ?? "",
    start_date: raw.start_date ?? null,
    end_date: raw.end_date ?? null,
    image_url: raw.image_url ?? null,
    exhibit_url: raw.exhibit_url ?? "",
  };
}

export function normalizeExhibits(rawList) {
  return rawList.map(normalizeExhibit);
}
