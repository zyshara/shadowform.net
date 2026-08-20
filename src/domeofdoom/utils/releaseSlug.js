// src/domeofdoom/utils/releaseSlug.js
//
// Moved out of the now-deleted Discography.jsx page - releaseSlug itself is
// still used by Artist.jsx to link to a release. Same slugify pattern as
// catalogItemSlug.js (each slug util owns its own copy rather than sharing
// one, since the two operate on different shapes of data).
function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function releaseSlug(release) {
  return `${slugify(release.release_name)}-${release.uid}`;
}
