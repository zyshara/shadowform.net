// server/domeofdoom/strapiArtists.js
//
// No HTTP routes here — getArtists/getArtistBySlug are called directly
// (not over HTTP) by server/domeofdoom/cron/syncStats.js. The /api/artists
// HTTP endpoints this file used to register had zero frontend callers and
// were removed. Targets the generic /api/artists Strapi content type, not
// DomeOfDoomArtist — unrelated to server/domeofdoom/artists.js, which holds
// the DomeOfDoomArtist name-splitting/matching helpers.

import { strapiGet } from "#lib/strapi.js";
import { artistPopulate } from "#lib/populate.js";

export async function getArtists(params = {}, opts = {}) {
  return strapiGet("/api/artists", {
    ...artistPopulate(),
    ...params,
  }, opts);
}

export async function getArtistBySlug(slug, opts = {}) {
  return getArtists({ "filters[slug][$eq]": slug }, opts);
}
