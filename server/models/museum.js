// server/models/museum.js

function slugToLabel(slug) {
  return slug
    .split("-")
    .map((w) => w === "and" ? "&" : w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function museumSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeMuseum(raw) {
  const image = raw.image ?? null;

  return {
    id: raw.id,
    slug: raw.slug || museumSlug(raw.name ?? ""),
    name: raw.name ?? "",
    address: raw.location_address ?? "",
    lat: raw.location_lat ?? null,
    lng: raw.location_lng ?? null,
    website_url: raw.website_url ?? "",
    ticket_url: raw.ticket_url ?? "",
    image_url: image?.url ?? null,
    status: raw.museum_status ?? "open",
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => t.slug).filter(Boolean) : [],
    _tagMeta: Array.isArray(raw.tags) ? raw.tags.map((t) => t.slug).filter(Boolean).map((s) => ({ slug: s, name: slugToLabel(s) })) : [],
  };
}

export function normalizeMuseums(rawList) {
  const museums = rawList.map(normalizeMuseum);

  // Derive unique sorted tag list across all museums
  const seen = new Map();
  for (const m of museums) {
    for (const t of m._tagMeta) {
      if (!seen.has(t.slug)) seen.set(t.slug, t.name);
    }
    delete m._tagMeta;
  }
  const tags = [...seen.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { museums, tags };
}
