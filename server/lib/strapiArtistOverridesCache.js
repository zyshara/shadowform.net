// server/lib/strapiArtistOverridesCache.js
//
// In-memory singleton for DomeOfDoomArtist.overrides data that the client
// needs merged onto the (otherwise purely Bandcamp-scraped) roster - just
// profile_picture for now. Keyed by uppercased artist name since that's
// the same matching key lib/artists.js already uses to resolve artist
// relations elsewhere in this pipeline. Same singleton-module-state shape
// as bandcampCache.js/strapiCatalogCache.js.

let profilePictures = new Map();

export function getArtistProfilePictures() {
  return profilePictures;
}

export function setArtistProfilePictures(map) {
  profilePictures = map;
}
