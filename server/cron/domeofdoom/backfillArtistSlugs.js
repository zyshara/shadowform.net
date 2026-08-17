// server/cron/domeofdoom/backfillArtistSlugs.js
//
// One-off: sets DomeOfDoomArtist.slug (via slugifyArtistName, see
// lib/artists.js) for every existing artist that doesn't have one yet -
// the field was just added to the Strapi model, so every existing record
// starts out with slug: null. Safe to re-run: skips any artist that
// already has a non-empty slug.
//
// Usage:
//   node --env-file=.env server/cron/domeofdoom/backfillArtistSlugs.js --dry-run
//   node --env-file=.env server/cron/domeofdoom/backfillArtistSlugs.js

import { strapiGet, strapiPut } from "../../lib/strapi.js";
import { slugifyArtistName } from "../../lib/artists.js";

const ARTISTS_PATH = "/api/dome-of-doom-artists";
const PAGE_SIZE = 100;
const WRITE_DELAY_MS = 150;

const DRY_RUN = process.argv.includes("--dry-run");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllArtists() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      ARTISTS_PATH,
      { "pagination[page]": page, "pagination[pageSize]": PAGE_SIZE },
      { noCache: true }
    );
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

async function main() {
  if (DRY_RUN) console.log("--- DRY RUN, no writes will be made ---\n");

  console.log("Loading Dome of Doom Artists from Strapi...");
  const artists = await fetchAllArtists();
  console.log(`${artists.length} artist(s) total\n`);

  const toBackfill = artists.filter((a) => !a.slug);
  console.log(`${toBackfill.length} artist(s) missing a slug\n`);

  // Surface it if backfilling would give two DIFFERENT existing records
  // the same slug - that means they're likely already-duplicate artist
  // entries sitting in Strapi (e.g. "Sfam" and "sfam" as two separate
  // rows), which need a human decision (merge them) rather than silently
  // both getting written with a colliding slug.
  const bySlug = new Map();
  for (const a of artists) {
    const slug = a.slug || slugifyArtistName(a.name);
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(a);
  }
  const collisions = [...bySlug.entries()].filter(([, group]) => group.length > 1);
  if (collisions.length > 0) {
    console.log(`⚠ ${collisions.length} slug collision(s) among EXISTING artists - likely duplicate records:`);
    for (const [slug, group] of collisions) {
      console.log(`  - "${slug}": ${group.map((a) => `"${a.name}" (${a.documentId ?? a.id})`).join(", ")}`);
    }
    console.log("These are not auto-merged - review and decide manually.\n");
  }

  let updated = 0;
  for (const artist of toBackfill) {
    const docId = artist.documentId ?? artist.id;
    const slug = slugifyArtistName(artist.name);

    if (!slug) {
      console.log(`  [skip] "${artist.name}" (${docId}) - name normalizes to an empty slug`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`  [dry] would set "${artist.name}" (${docId}) -> slug: "${slug}"`);
    } else {
      await strapiPut(`${ARTISTS_PATH}/${docId}`, { data: { slug } });
      console.log(`  [updated] "${artist.name}" (${docId}) -> slug: "${slug}"`);
      await sleep(WRITE_DELAY_MS);
    }
    updated++;
  }

  console.log(`\n${DRY_RUN ? "Would update" : "Updated"} ${updated} artist(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
