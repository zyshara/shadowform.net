// server/lib/populate.js
// Reusable Strapi populate param builders.

/**
 * Returns populate params for the artist content type.
 *
 * @param {string} prefix - the populate path up to (but not including) the
 *   field name. Defaults to "populate" for top-level artist queries.
 *
 * Examples:
 *   artistPopulate()
 *   // → { "populate[icon][fields]": "*", ... }
 *
 *   artistPopulate("populate[artists][populate][artist][populate]")
 *   // → { "populate[artists][populate][artist][populate][icon][fields]": "*", ... }
 */
export function artistPopulate(prefix = "populate") {
  return {
    [`${prefix}[icon][fields]`]:                 "*",
    [`${prefix}[artist_statistics][fields]`]:    "*",
    [`${prefix}[primary_genre]`]:                "*",
    [`${prefix}[genres]`]:                       "*",
    [`${prefix}[instagram]`]:                    "*",
    [`${prefix}[spotify]`]:                      "*",
    [`${prefix}[songkick]`]:                     "*",
  };
}
