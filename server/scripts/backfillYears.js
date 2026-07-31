// server/scripts/backfillYears.js
//
// Scrapes each Bandcamp release page for its release year and writes it back
// to Strapi. Only touches entries where `year` is currently null.
//
// Usage: node server/scripts/backfillYears.js [--dry-run]

import "dotenv/config";
import { strapiGet, strapiPut } from "../lib/strapi.js";

const RELEASES_PATH = "/api/dome-of-doom-releases";
const PAGE_SIZE = 100;
const DELAY_MS = 350;
const DRY_RUN = process.argv.includes("--dry-run");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchAllEntries() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      RELEASES_PATH,
      {
        "fields[0]": "name",
        "fields[1]": "bandcamp_url",
        "fields[2]": "year",
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

async function scrapeYear(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; shadowform-bot/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // JSON-LD / structured data: "datePublished":"20 Sep 2024 04:14:47 GMT"
  // This is what Bandcamp renders as "released <date>" on the page.
  const published = html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1];
  if (published) {
    const y = new Date(published).getUTCFullYear();
    if (!isNaN(y)) return y;
  }

  // Visible text fallback: "released 20 September 2024" or "released September 20, 2024"
  // Grab the 4-digit year that appears after the word "released"
  const relText = html.match(/released\s+[A-Za-z0-9 ,]+?(\d{4})/)?.[1];
  if (relText) {
    const y = parseInt(relText, 10);
    if (!isNaN(y) && y > 1980 && y <= new Date().getFullYear()) return y;
  }

  return null;
}

async function main() {
  if (DRY_RUN) console.log("--- DRY RUN ---");

  console.log("Fetching releases from Strapi...");
  const entries = await fetchAllEntries();
  console.log(`  ${entries.length} total entries`);

  const toUpdate = entries.filter((e) => {
    const year = e.year ?? e.attributes?.year;
    const url  = e.bandcamp_url ?? e.attributes?.bandcamp_url;
    return url && (year === null || year === undefined);
  });

  console.log(`  ${toUpdate.length} missing year with a bandcamp_url\n`);

  let updated = 0;
  let skipped = 0;
  let failed  = 0;

  for (const entry of toUpdate) {
    const docId = entry.documentId ?? entry.id;
    const name  = entry.name ?? entry.attributes?.name ?? "(unnamed)";
    const url   = entry.bandcamp_url ?? entry.attributes?.bandcamp_url;

    try {
      const year = await scrapeYear(url);
      if (!year) {
        console.warn(`  [skip] ${name} — no year found on page`);
        skipped++;
      } else if (DRY_RUN) {
        console.log(`  [dry]  ${name} → ${year}`);
        updated++;
      } else {
        await strapiPut(`${RELEASES_PATH}/${docId}`, { data: { year } });
        console.log(`  [ok]   ${name} → ${year}`);
        updated++;
      }
    } catch (err) {
      console.error(`  [err]  ${name}: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. Updated: ${updated}, skipped: ${skipped}, errors: ${failed}`);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
