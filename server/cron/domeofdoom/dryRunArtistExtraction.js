// server/cron/domeofdoom/dryRunArtistExtraction.js
//
// One-off exploration script, NOT part of the regular cron schedule and
// not wired into index.js - read-only, makes zero writes to Strapi. Run
// directly: `node --env-file=.env server/cron/domeofdoom/dryRunArtistExtraction.js`
//
// backfillCatalogItems.js now uses lib/artists.js's
// resolveArtistNamesFromRawItem for its real derived.artists computation
// (both the artists field AND tracks[].artist, with the same remix/flip/
// VIP-credit filtering this script validated) and auto-creates anything
// unmatched. This script still exists as a magnifying glass on top of
// that same shared logic - useful for previewing/auditing what a given
// scrape would surface (broken down by source, with example locations)
// before or after a real run, without needing to actually create anything
// or dig through cron log output.
//
// Grouped by slugifyArtistName (see lib/artists.js) rather than raw string,
// so casing/punctuation/accent variants of the same artist (e.g. "Sfam" vs
// "sfam", or "(DJ) NOBOD¥" vs "DJ Nobody") collapse into one entry instead
// of inflating the "new artist" count with duplicates of names we already
// have.

import { strapiGet } from "../../lib/strapi.js";
import {
  splitArtistString,
  slugifyArtistName,
  parseReinterpretationCredit,
  loadArtistCache,
} from "../../lib/artists.js";

const RAW_ITEMS_PATH = "/api/dome-of-doom-bandcamp-item-raws";
const PAGE_SIZE = 100;

async function fetchAllRawItems() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      RAW_ITEMS_PATH,
      { "pagination[page]": page, "pagination[pageSize]": PAGE_SIZE },
      { noCache: true }
    );
    all.push(...res.data);
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

// slug -> { variants: Set(raw casing/spelling seen), locations: Set("item / track") }
function addOccurrence(map, rawName, where) {
  const slug = slugifyArtistName(rawName);
  if (!slug) return;
  if (!map.has(slug)) map.set(slug, { variants: new Set(), locations: new Set() });
  const entry = map.get(slug);
  entry.variants.add(rawName);
  entry.locations.add(where);
}

async function main() {
  console.log("Loading raw Bandcamp items + existing artist roster from Strapi...");
  const [rawItems, artistCache] = await Promise.all([fetchAllRawItems(), loadArtistCache()]);

  const rosterSlugs = new Set([...artistCache.values()].map((v) => slugifyArtistName(v.name)));
  console.log(`${rawItems.length} raw item(s), ${artistCache.size} known roster artist(s)\n`);

  const fromArtistsField = new Map();
  const fromTracksField = new Map();
  // Names that ONLY ever showed up as the "original artist" half of a
  // remix credit - held separately, not counted as real candidates unless
  // they're also independently confirmed elsewhere (see the merge step
  // below "if we see something like Track Name - Artist1 we add them
  // back").
  const remixCreditOnly = new Map();

  for (const raw of rawItems) {
    const title = raw.name ?? raw.attributes?.name ?? "(untitled)";

    for (const entry of raw.artists ?? raw.attributes?.artists ?? []) {
      for (const name of splitArtistString(entry.name)) {
        addOccurrence(fromArtistsField, name, title);
      }
    }

    for (const track of raw.tracks ?? raw.attributes?.tracks ?? []) {
      const where = `${title} / ${track.title ?? "(untitled track)"}`;
      const remix = parseReinterpretationCredit(track.title);

      if (remix) {
        if (remix.originalArtistRaw) {
          // Dash-prefixed form - track.artist duplicates this embedded
          // name, and it's the one to treat as "unconfirmed, exclude
          // unless seen elsewhere" (see Ray Keith/Shy FX).
          for (const name of splitArtistString(remix.originalArtistRaw)) {
            addOccurrence(remixCreditOnly, name, where);
          }
        } else if (track.artist) {
          // Suffix-only form - nothing embedded in the title to exclude,
          // so track.artist (if set at all) is independent info and
          // counts normally.
          for (const name of splitArtistString(track.artist)) {
            addOccurrence(fromTracksField, name, where);
          }
        }
        for (const name of splitArtistString(remix.reinterpreterClause)) {
          addOccurrence(fromTracksField, name, `${where} (remixer)`);
        }
      } else {
        for (const name of splitArtistString(track.artist)) {
          addOccurrence(fromTracksField, name, where);
        }
      }
    }
  }

  // A remix-credit-only name is "added back" (per the requested logic)
  // once it's independently confirmed by showing up somewhere that ISN'T
  // a remix original-artist credit - either the release-level artists
  // field, or a different, non-remix track. Names that never show up
  // outside of remix credits stay excluded (e.g. Ray Keith, Shy FX -
  // source-track artists Daedelus remixed, not DOD collaborators).
  const excludedRemixOnly = new Map();
  for (const [slug, entry] of remixCreditOnly) {
    if (fromArtistsField.has(slug) || fromTracksField.has(slug)) {
      const target = fromTracksField.get(slug) ?? fromArtistsField.get(slug);
      entry.variants.forEach((v) => target.variants.add(v));
      entry.locations.forEach((l) => target.locations.add(l));
    } else {
      excludedRemixOnly.set(slug, entry);
    }
  }

  const isKnown = (slug) => rosterSlugs.has(slug);

  const formatVariants = (entry) => {
    const variants = [...entry.variants];
    return variants.length > 1 ? `${variants[0]} (also seen as: ${variants.slice(1).join(", ")})` : variants[0];
  };

  const report = (label, map) => {
    const slugs = [...map.keys()].sort();
    const known = slugs.filter(isKnown);
    const unknown = slugs.filter((s) => !isKnown(s));
    console.log(`--- ${label} ---`);
    console.log(`${slugs.length} unique artist(s): ${known.length} already in roster, ${unknown.length} NOT in roster`);
    if (unknown.length > 0) {
      console.log("New candidates (with up to 3 example locations each):");
      for (const slug of unknown.sort((a, b) => formatVariants(map.get(a)).localeCompare(formatVariants(map.get(b))))) {
        const entry = map.get(slug);
        const examples = [...entry.locations].slice(0, 3);
        console.log(`  - ${formatVariants(entry)} <- ${examples.join("; ")}${entry.locations.size > 3 ? "; ..." : ""}`);
      }
    }
    console.log("");
    return { slugs, known, unknown };
  };

  report("artists field (release-level, already split by backfillCatalogItems today)", fromArtistsField);
  const tracksResult = report("tracks[].artist field (NOT currently mined anywhere - this is the new part)", fromTracksField);

  const newFromTracksOnly = tracksResult.unknown.filter((slug) => !fromArtistsField.has(slug));
  console.log("--- Net new signal from tracks[].artist specifically ---");
  console.log(
    `${newFromTracksOnly.length} artist(s) are unmatched AND weren't already surfaced by the artists field split:`
  );
  for (const slug of newFromTracksOnly.sort((a, b) =>
    formatVariants(fromTracksField.get(a)).localeCompare(formatVariants(fromTracksField.get(b)))
  )) {
    const entry = fromTracksField.get(slug);
    const examples = [...entry.locations].slice(0, 3);
    console.log(`  - ${formatVariants(entry)} <- ${examples.join("; ")}${entry.locations.size > 3 ? "; ..." : ""}`);
  }
  console.log("");

  console.log("--- Excluded: remix-credit-only (original artist of a track someone else remixed) ---");
  console.log(
    `${excludedRemixOnly.size} name(s) only ever appeared as the pre-dash artist in an "X - Song (Y Remix)" ` +
    `track title, never anywhere else - not added as candidates:`
  );
  for (const slug of [...excludedRemixOnly.keys()].sort((a, b) =>
    formatVariants(excludedRemixOnly.get(a)).localeCompare(formatVariants(excludedRemixOnly.get(b)))
  )) {
    const entry = excludedRemixOnly.get(slug);
    const examples = [...entry.locations].slice(0, 3);
    console.log(`  - ${formatVariants(entry)} <- ${examples.join("; ")}${entry.locations.size > 3 ? "; ..." : ""}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
