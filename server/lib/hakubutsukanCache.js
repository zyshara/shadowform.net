// In-memory singletons for normalized hakubutsukan data. Same pattern as
// strapiCatalogCache.js — fetchAndCacheHakubutsukanData.js writes here;
// server/routes/spas.js reads to seed the client bundle per request.

import { createEntityCache } from "./createEntityCache.js";

const museumsCache    = createEntityCache([]);
const exhibitsCache   = createEntityCache([]);
const heroImagesCache = createEntityCache([]);
const tagsCache       = createEntityCache([]);

export const getMuseums = museumsCache.get;
export const setMuseums = museumsCache.set;

export const getExhibits = exhibitsCache.get;
export const setExhibits = exhibitsCache.set;

export const getHeroImages = heroImagesCache.get;
export const setHeroImages = heroImagesCache.set;

export const getTags = tagsCache.get;
export const setTags = tagsCache.set;
