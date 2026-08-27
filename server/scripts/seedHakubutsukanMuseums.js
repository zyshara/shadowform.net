// server/scripts/seedHakubutsukanMuseums.js
//
// One-time seed of the hakubutsukan-museum content type in Strapi.
// Run with: node --experimental-vm-modules server/scripts/seedHakubutsukanMuseums.js
//
// Requires STRAPI_API_URL and STRAPI_API_TOKEN in env (or .env file).
// Skips any museum whose name already exists (by slug check).

import "dotenv/config";
import { strapiPost, strapiGet } from "../lib/strapi.js";

const MUSEUMS = [
  {
    name: "Museum of Jurassic Technology",
    slug: "the-museum-of-jurassic-technology",
    location_address: "9341 Venice Blvd, Culver City, CA 90232",
    website_url: "https://www.mjt.org",
    ticket_url: "https://www.mjt.org",
    museum_status: "open",
  },
  {
    name: "The Getty Center",
    slug: "the-getty-center",
    location_address: "1200 Getty Center Dr, Los Angeles, CA 90049",
    website_url: "https://www.getty.edu/visit/center",
    ticket_url: "https://www.getty.edu/visit/center",
    museum_status: "open",
  },
  {
    name: "The Getty Villa",
    slug: "the-getty-villa",
    location_address: "17985 Pacific Coast Hwy, Pacific Palisades, CA 90272",
    website_url: "https://www.getty.edu/visit/villa",
    ticket_url: "https://www.getty.edu/visit/villa",
    museum_status: "open",
  },
  {
    name: "The Broad",
    slug: "the-broad",
    location_address: "221 S Grand Ave, Los Angeles, CA 90012",
    website_url: "https://www.thebroad.org",
    ticket_url: "https://www.thebroad.org/visit/tickets",
    museum_status: "open",
  },
  {
    name: "UCLA Hammer Museum",
    slug: "ucla-hammer-museum",
    location_address: "10899 Wilshire Blvd, Los Angeles, CA 90024",
    website_url: "https://hammer.ucla.edu",
    ticket_url: "https://hammer.ucla.edu/visit",
    museum_status: "open",
  },
  {
    name: "LACMA",
    slug: "lacma",
    location_address: "5905 Wilshire Blvd, Los Angeles, CA 90036",
    website_url: "https://www.lacma.org",
    ticket_url: "https://www.lacma.org/visit",
    museum_status: "open",
  },
  {
    name: "Natural History Museum of LA",
    slug: "natural-history-museum-la",
    location_address: "900 Exposition Blvd, Los Angeles, CA 90007",
    website_url: "https://nhmlac.org",
    ticket_url: "https://nhmlac.org/visit",
    museum_status: "open",
  },
  {
    name: "Fowler Museum at UCLA",
    slug: "fowler-museum-at-ucla",
    location_address: "308 Charles E Young Dr N, Los Angeles, CA 90095",
    website_url: "https://fowler.ucla.edu",
    ticket_url: "https://fowler.ucla.edu/visit",
    museum_status: "open",
  },
  {
    name: "The Huntington",
    slug: "the-huntington",
    location_address: "1151 Oxford Rd, San Marino, CA 91108",
    website_url: "https://www.huntington.org",
    ticket_url: "https://www.huntington.org/visit",
    museum_status: "open",
  },
  {
    name: "&& Gallery",
    slug: "andand-gallery",
    location_address: "3045 W 8th St, Los Angeles, CA 90005",
    website_url: "https://andand.gallery",
    ticket_url: "https://andand.gallery",
    museum_status: "open",
  },
  {
    name: "Japanese American National Museum",
    slug: "japanese-american-national-museum",
    location_address: "100 N Central Ave, Los Angeles, CA 90012",
    website_url: "https://www.janm.org",
    ticket_url: "https://www.janm.org/visit",
    museum_status: "open",
  },
];

async function slugExists(slug) {
  try {
    const res = await strapiGet("/api/hakubutsukan-museums", {
      "filters[slug][$eq]": slug,
      "pagination[pageSize]": 1,
    });
    return res.data.length > 0;
  } catch {
    return false;
  }
}

async function seed() {
  let created = 0;
  let skipped = 0;

  for (const museum of MUSEUMS) {
    if (await slugExists(museum.slug)) {
      console.log(`skip  ${museum.name}`);
      skipped++;
      continue;
    }

    await strapiPost("/api/hakubutsukan-museums", { data: museum });
    console.log(`added ${museum.name}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
