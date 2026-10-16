// server/domeofdoom/bandcampCache.js
//
// In-memory singletons for Bandcamp-scraped data. The cron jobs write to
// these; server/routes/spas.js reads them to seed the domeofdoom client
// bundle on each request.

import { createEntityCache } from "#lib/createEntityCache.js";

const rosterCache       = createEntityCache([]);
const merchCache        = createEntityCache([]);
const showsCache        = createEntityCache([]);
const aboutPageCache    = createEntityCache(null);

export const getRoster = rosterCache.get;
export const setRoster = rosterCache.set;

export const getMerch = merchCache.get;
export const setMerch = merchCache.set;

export const getShows = showsCache.get;
export const setShows = showsCache.set;

export const getAboutPage = aboutPageCache.get;
export const setAboutPage = aboutPageCache.set;
