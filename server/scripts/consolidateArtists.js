// server/scripts/consolidateArtists.js
// One-time script: merge duplicate Dome of Doom Artist entries.
// For each pair, finds releases linked to the "from" artist, swaps to "into",
// then deletes the "from" artist.
//
// Usage: node server/scripts/consolidateArtists.js [--dry-run]

import "dotenv/config";
import { strapiGet, strapiPut } from "../lib/strapi.js";

const RELEASES_PATH = "/api/dome-of-doom-releases";
const ARTISTS_PATH  = "/api/dome-of-doom-artists";
const PAGE_SIZE     = 100;
const DRY_RUN       = process.argv.includes("--dry-run");

// from (delete) → into (keep)
const MERGES = [
  { from: "Ahee",       into: "AHEE"       },
  { from: "Shrimpnose", into: "shrimpnose" },
  { from: "Muadeep",    into: "MUADEEP"    },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchAllArtists() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(ARTISTS_PATH, {
      "fields[0]": "name",
      "pagination[page]": page,
      "pagination[pageSize]": PAGE_SIZE,
    }, { noCache: true });
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

async function fetchReleasesForArtist(artistDocId) {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(RELEASES_PATH, {
      "filters[artists][documentId][$eq]": artistDocId,
      "fields[0]": "name",
      "populate[artists][fields][0]": "name",
      "pagination[page]": page,
      "pagination[pageSize]": PAGE_SIZE,
    }, { noCache: true });
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

async function strapiDelete(path) {
  const STRAPI_URL   = process.env.STRAPI_API_URL   || "https://strapi-shadowform-52c53315c615.herokuapp.com";
  const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: "DELETE",
    headers: { ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DELETE ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function main() {
  if (DRY_RUN) console.log("--- DRY RUN ---\n");

  console.log("Fetching all artists...");
  const artists = await fetchAllArtists();

  // Build name → { docId, name } map (case-sensitive)
  const byName = new Map(artists.map(a => [
    a.name ?? a.attributes?.name,
    { docId: a.documentId ?? a.id, name: a.name ?? a.attributes?.name },
  ]));

  for (const { from, into } of MERGES) {
    console.log(`\n── Merging "${from}" → "${into}" ──`);

    const fromEntry = byName.get(from);
    const intoEntry = byName.get(into);

    if (!fromEntry) { console.log(`  [skip] "${from}" not found`); continue; }
    if (!intoEntry) { console.log(`  [skip] "${into}" not found`); continue; }

    console.log(`  from: ${from} (${fromEntry.docId})`);
    console.log(`  into: ${into} (${intoEntry.docId})`);

    // Find releases linked to the "from" artist
    const releases = await fetchReleasesForArtist(fromEntry.docId);
    console.log(`  ${releases.length} release(s) to re-link`);

    for (const release of releases) {
      const releaseDocId = release.documentId ?? release.id;
      const releaseName  = release.name ?? release.attributes?.name;

      // Current artist docIds on this release, minus "from", plus "into"
      const currentArtists = Array.isArray(release.artists)
        ? release.artists
        : release.attributes?.artists?.data ?? [];

      const currentIds = currentArtists.map(a => a.documentId ?? a.id);
      const newIds = [...new Set([
        ...currentIds.filter(id => id !== fromEntry.docId),
        intoEntry.docId,
      ])];

      if (DRY_RUN) {
        console.log(`  [dry] "${releaseName}" → artists set to [${newIds.join(", ")}]`);
      } else {
        await strapiPut(`${RELEASES_PATH}/${releaseDocId}`, { data: { artists: newIds } });
        console.log(`  [ok]  "${releaseName}" re-linked`);
        await sleep(250);
      }
    }

    // Delete the "from" artist
    if (DRY_RUN) {
      console.log(`  [dry] would delete artist "${from}" (${fromEntry.docId})`);
    } else {
      await strapiDelete(`${ARTISTS_PATH}/${fromEntry.docId}`);
      console.log(`  [deleted] "${from}"`);
    }
  }

  console.log("\nDone.");
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
