// src/domeofdoom/utils/artistSlug.js
//
// Shared between the Roster page (linking to an artist) and the Artist page
// (resolving the :artistSlug route param back to a roster entry) so the two
// never drift — lowercase, spaces to dashes, nothing else stripped.
export function artistSlug(name) {
  return (name ?? "").toLowerCase().trim().replace(/\s+/g, "-");
}
