// server/scripts/backfillCatalogNumbersFromDiscography.js
//
// One-off, manual, NOT wired into cron/index.js. Parses the official
// discography list at https://www.domeofdoom.org/artists (a static/SSR
// page, "ARTIST - TITLE // DOD_NNN" entries, each one a real link to the
// Bandcamp album) and backfills DomeOfDoomCatalogItem.overrides.
// catalog_number for any item that's missing one.
//
// Matched by the bandcamp_url's SLUG (the /album/<slug> part) rather than
// the full URL - the discography page links to domeofdoom.bandcamp.com
// (the label's own cross-post of the release), while our scraped
// bandcamp_url is a mix of that AND individual artists' own subdomains
// (e.g. gnomebeats.bandcamp.com) depending on which page got scraped, so
// full-URL matching only caught 19/91 in practice. The slug itself is
// still an exact, non-fuzzy match (no title/artist text comparison at
// all - that stays intentionally out of scope, see conversation history)
// - just tolerant of the domain differing, and of Bandcamp's own "-2"
// disambiguation suffix on an artist's own page (matched via prefix:
// "las-formas-en-flujo" vs our "las-formas-en-flujo-2").
//
// catalog_number lives ONLY in `overrides` (see server/models/
// catalogItem.js) - the human-confirmed field, never `derived` - so this
// writes there, and only ever INTO A GAP: an item that already has a
// catalog_number set (even a DIFFERENT one from what this page says) is
// left alone and reported as a conflict for manual review, never
// overwritten automatically.
//
// Usage:
//   node --env-file=.env server/scripts/backfillCatalogNumbersFromDiscography.js --dry-run
//   node --env-file=.env server/scripts/backfillCatalogNumbersFromDiscography.js

import { strapiGet, strapiPut } from "../lib/strapi.js";

const DISCOGRAPHY_URL = "https://www.domeofdoom.org/artists";
const CATALOG_ITEMS_PATH = "/api/dome-of-doom-catalog-items";
const PAGE_SIZE = 100;
const WRITE_DELAY_MS = 150;

const DRY_RUN = process.argv.includes("--dry-run");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Every entry on the page is `<a href="...bandcamp.com/album/...">ARTIST
// - TITLE // CATNO</a>` (confirmed against the real page's HTML before
// writing this, not guessed) - catalog number is whatever's after the
// LAST "//" so a title that itself happens to contain "//" doesn't
// truncate it early.
const ENTRY_RE = /<a href="([^"]*bandcamp\.com\/album\/[^"]*)"[^>]*>([^<]+)<\/a>/g;

async function fetchDiscographyEntries() {
  const res = await fetch(DISCOGRAPHY_URL);
  if (!res.ok) throw new Error(`Failed to fetch ${DISCOGRAPHY_URL}: ${res.status}`);
  const html = await res.text();

  const entries = [];
  for (const match of html.matchAll(ENTRY_RE)) {
    const [, bandcampUrl, rawText] = match;
    const text = decodeHtmlEntities(rawText).trim();
    const lastSlashes = text.lastIndexOf("//");
    if (lastSlashes === -1) continue; // no catalog number present, skip
    const catalogNumber = text.slice(lastSlashes + 2).trim();
    const label = text.slice(0, lastSlashes).trim();
    if (!catalogNumber) continue;
    entries.push({ bandcampUrl, catalogNumber, label });
  }
  return entries;
}

async function fetchAllCatalogItems() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      CATALOG_ITEMS_PATH,
      {
        "populate[overrides][populate]": "*",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

// "https://gnomebeats.bandcamp.com/album/las-formas-en-flujo-2" -> "las-formas-en-flujo-2"
function slugOf(bandcampUrl) {
  const marker = "/album/";
  const i = (bandcampUrl || "").indexOf(marker);
  if (i === -1) return null;
  return bandcampUrl.slice(i + marker.length).replace(/\/$/, "") || null;
}

function findBySlug(itemsBySlug, slug) {
  const exact = itemsBySlug.get(slug);
  if (exact) return exact;
  // Bandcamp's own "-2"/"-3" disambiguation suffix on an artist's own
  // re-post of a release the label already has under its own subdomain -
  // still an exact match on the meaningful part of the slug, not a fuzzy
  // text comparison.
  for (const [key, item] of itemsBySlug) {
    if (key.startsWith(`${slug}-`)) return item;
  }
  return null;
}

async function main() {
  if (DRY_RUN) console.log("--- DRY RUN, no writes will be made ---\n");

  console.log(`Fetching discography list from ${DISCOGRAPHY_URL}...`);
  const entries = await fetchDiscographyEntries();
  console.log(`${entries.length} entries parsed\n`);

  console.log("Loading DomeOfDoomCatalogItem records from Strapi...");
  const items = await fetchAllCatalogItems();
  const itemsBySlug = new Map();
  for (const item of items) {
    const slug = slugOf(item.bandcamp_url);
    if (slug) itemsBySlug.set(slug, item);
  }
  console.log(`${items.length} catalog item(s) in Strapi\n`);

  const toBackfill = [];
  const conflicts = [];
  const noMatch = [];
  const alreadySet = [];

  for (const entry of entries) {
    const entrySlug = slugOf(entry.bandcampUrl);
    const item = entrySlug ? findBySlug(itemsBySlug, entrySlug) : null;
    if (!item) {
      noMatch.push(entry);
      continue;
    }
    const existing = item.overrides?.catalog_number;
    if (!existing) {
      toBackfill.push({ entry, item });
    } else if (existing === entry.catalogNumber) {
      alreadySet.push(entry);
    } else {
      conflicts.push({ entry, item, existing });
    }
  }

  console.log(`--- Would backfill (no catalog_number set yet): ${toBackfill.length} ---`);
  for (const { entry, item } of toBackfill) {
    console.log(`  ${entry.catalogNumber.padEnd(12)} <- "${entry.label}" (${item.derived?.title ?? item.bandcamp_url})`);
  }

  console.log(`\n--- Already correct, no change needed: ${alreadySet.length} ---`);

  console.log(`\n--- Conflicts (already has a DIFFERENT catalog_number - not touched): ${conflicts.length} ---`);
  for (const { entry, item, existing } of conflicts) {
    console.log(
      `  "${entry.label}": page says ${entry.catalogNumber}, Strapi already has ${existing} ` +
      `(${item.derived?.title ?? item.bandcamp_url})`
    );
  }

  console.log(`\n--- No matching catalog item in Strapi (bandcamp_url not found): ${noMatch.length} ---`);
  for (const entry of noMatch) {
    console.log(`  ${entry.catalogNumber.padEnd(12)} <- "${entry.label}" (${entry.bandcampUrl})`);
  }

  if (!DRY_RUN) {
    console.log(`\nWriting ${toBackfill.length} catalog_number override(s)...`);
    for (const { entry, item } of toBackfill) {
      const docId = item.documentId ?? item.id;
      await strapiPut(`${CATALOG_ITEMS_PATH}/${docId}`, {
        data: { overrides: { ...item.overrides, catalog_number: entry.catalogNumber } },
      });
      await sleep(WRITE_DELAY_MS);
    }
    console.log("Done.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
