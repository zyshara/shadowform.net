// src/domeofdoom/data/vinylDiscOverrides.js
//
// Manual override: swap the CSS-drawn VinylRecord for real photographed
// disc art on specific vinyl packages, keyed by the package's Bandcamp
// item id (packages[].id from dod-bandcamp-scraper - always present on
// every package, unlike sku/upc which are frequently null). Any vinyl
// package NOT listed here keeps the standard CSS disc.
//
// Up to 2 images per entry (e.g. a 2xLP's two discs) - VinylRecord.jsx
// staggers them (each one further right/back) so both peek out from
// behind the sleeve when there's more than one.
const VINYL_DISC_OVERRIDES = {
  // Dome of Doom 15 Year Anniversary Compilation - 2xLP
  // (sku D-DOD1-LE2M, upc 881453116186)
  3740439881: [
    "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1787204948/15yrcomp_original_disc2_6e76e4e5d3.png",
    "https://res.cloudinary.com/dfeyhbxeg/image/upload/v1787204948/15yrcomp_original_disc1_ea0c8e1782.png",
  ],
};

export function getVinylDiscOverride(pkg) {
  return VINYL_DISC_OVERRIDES[pkg?.id] ?? null;
}

export default VINYL_DISC_OVERRIDES;
