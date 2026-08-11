// src/domeofdoom/utils/catalogItemSlug.js
//
// Shared between the Catalog grid (linking to an item) and the CatalogItem
// page (resolving the :catalogParam route param back to an item) so the two
// never drift. Items with a human-assigned catalog_number (overrides-only,
// see catalog-item-overrides.json) use that directly as the URL segment
// (e.g. /catalog/DOD_088) since it's already a stable, human-facing id.
// Items without one fall back to a title-slug + uid suffix, same pattern as
// Discography's releaseSlug - the uid suffix guarantees uniqueness even
// when titles collide or are empty.
function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function catalogItemSlug(item) {
  if (item.catalog_number) return item.catalog_number;
  return `${slugify(item.title)}-${item.uid}`;
}

// Resolves a :catalogParam route value back to an item. catalog_number is
// matched first (case-insensitive - it's operator-typed free text) since
// that's the primary format going forward; falling back to the slug's uid
// suffix keeps existing /catalog/{slug} links working for items that don't
// have one set.
export function findByCatalogParam(items, param) {
  if (!param) return null;
  const byCatalogNumber = items.find(
    (item) => item.catalog_number && item.catalog_number.toLowerCase() === param.toLowerCase()
  );
  if (byCatalogNumber) return byCatalogNumber;

  const idx = param.lastIndexOf("-");
  const uid = idx === -1 ? param : param.slice(idx + 1);
  return items.find((item) => item.uid === uid) ?? null;
}
