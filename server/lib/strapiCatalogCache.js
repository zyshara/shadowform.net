// server/lib/strapiCatalogCache.js
//
// In-memory singleton for the normalized DomeofDoomCatalogItem list — same
// shape/purpose as bandcampCache.js (module state as a natural singleton),
// kept separate since this is Strapi CMS data, not raw Bandcamp scrape
// output. fetchAndCacheStrapiData.js writes to this; server/routes/spas.js
// reads it to seed the domeofdoom client bundle on each request.

let catalogItems = [];

export function getCatalogItems() {
  return catalogItems;
}

export function setCatalogItems(items) {
  catalogItems = items;
}
