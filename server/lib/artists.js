import { strapiGetAllPages } from "#lib/strapi.js";
import { artistPopulate } from "#lib/populate.js";

// Generic artist records used by cross-tenant statistics jobs. Label-specific
// roster records have a separate schema and stay in apps/domeofdoom.
export function getAllArtists() {
  return strapiGetAllPages("/api/artists", artistPopulate());
}
