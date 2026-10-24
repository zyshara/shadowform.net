import { strapiGetAllPages } from "#lib/strapi.js";
import { normalizeCatalogItems } from "./models/catalogItem.js";
import { normalizeArtists } from "./models/artist.js";
import { normalizeShows } from "./models/show.js";
import { getPress } from "./press.js";

import { cached } from "#lib/cache.js";

const populate = { "populate[derived][populate]": "*", "populate[overrides][populate]": "*" };

export const getCatalog = cached(async () => normalizeCatalogItems(
  await strapiGetAllPages("/api/dome-of-doom-catalog-items", populate)
));

export const getArtists = cached(async () => normalizeArtists(
  await strapiGetAllPages("/api/dome-of-doom-artists", populate)
));

// Artist detail pages still show upcoming dates; /shows itself is a placeholder.
export const getShows = cached(async () => {
  const [entries, artists] = await Promise.all([
    strapiGetAllPages("/api/dome-of-doom-shows", {
      populate: "*", "sort[0]": "date:desc",
    }),
    getArtists(),
  ]);
  const photos = new Map(artists.map((a) => [a.name.trim().toUpperCase(), a.photo_src]));
  return normalizeShows(entries, photos);
});

export const getPressItems = cached(getPress);

export { getEventIndex, getEventPage } from './eventContent.js';
