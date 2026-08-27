// Fetches museums, exhibits, and hero images from Strapi, normalizes them,
// and caches in memory. The cache is read by server/routes/spas.js to seed
// the hakubutsukan client bundle on each request — no direct Strapi calls
// from the browser needed.

import { strapiGet } from "../../lib/strapi.js";
import { setMuseums, setExhibits, setHeroImages, setTags } from "../../lib/hakubutsukanCache.js";
import { normalizeMuseums } from "../../models/museum.js";
import { normalizeExhibits } from "../../models/exhibit.js";
import { normalizeHeroImages } from "../../models/heroImage.js";
import { logger } from "../../lib/logger.js";

const PAGE_SIZE = 100;

async function fetchAll(path, params = {}) {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      path,
      { ...params, "pagination[page]": page, "pagination[pageSize]": PAGE_SIZE },
      { noCache: true }
    );
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

export async function fetchAndCacheHakubutsukanData() {
  const [rawMuseums, rawExhibits, rawHeroImages] = await Promise.all([
    fetchAll("/api/hakubutsukan-museums", {
      "populate[image][fields][0]": "url",
      "populate[tags][fields][0]": "slug",
    }),
    fetchAll("/api/hakubutsukan-exhibits", {
      "populate[museum][fields][0]": "id",
      "populate[museum][fields][1]": "name",
      "populate[museum][fields][2]": "slug",
    }),
    fetchAll("/api/hakubutsukan-hero-images", {
      "populate[image][fields][0]": "url",
    }),
  ]);

  const { museums, tags } = normalizeMuseums(rawMuseums);
  const exhibits          = normalizeExhibits(rawExhibits);
  const heroImages        = normalizeHeroImages(rawHeroImages);

  setMuseums(museums);
  setTags(tags);
  setExhibits(exhibits);
  setHeroImages(heroImages);

  logger.info(
    `[hakubutsukanCache] cached ${museums.length} museum(s), ` +
    `${exhibits.length} exhibit(s), ${heroImages.length} hero image(s)`
  );

  return { museumCount: museums.length, exhibitCount: exhibits.length, heroImageCount: heroImages.length };
}
