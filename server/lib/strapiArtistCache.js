// server/lib/strapiArtistCache.js
//
// In-memory singleton for the normalized DomeOfDoomArtist list - same
// shape/purpose as strapiCatalogCache.js. Replaces the old
// strapiArtistOverridesCache.js (a narrower profile_picture-only overlay
// on top of the Bandcamp-scraped roster) now that Roster/Artist pages read
// this fully-normalized Strapi list directly instead.

import { createEntityCache } from "./createEntityCache.js";

const artistsCache = createEntityCache([]);

export const getArtists = artistsCache.get;
export const setArtists = artistsCache.set;
