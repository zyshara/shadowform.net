// server/cron/domeofdoom/backfillCatalogItems.js
//
// Derives DomeofDoomCatalogItem rows from DomeOfDoomBandcampItemRaw (Layer
// 1 -> Layer 2). One CatalogItem per raw row where item_type is "album" or
// "track" AND sources includes "music" - Bandcamp's /music page is the
// source of truth for catalog membership for now (see conversation
// history: label owner needs to weigh in on whether /merch-only physical
// releases should also count before we widen this).
//
// Idempotent: upserts by bandcamp_url. derived is fully recomputed and
// overwritten on every run - never touches overrides.
//
// label_role in `derived` is a SUGGESTION only, not a confirmed value:
//   1. "reissue" in title -> reissue
//   2. a package with formatType containing "digital" AND availability
//      "OnlineOnly" -> original
//   3. a package with formatType containing vinyl/cassette/compact disc -> physical
//   4. else -> other
// A human confirms the real value in overrides.label_role; derived's guess
// is never treated as final (see conversation history re: Alpha Dog).

import { strapiGet, strapiPost, strapiPut } from "../../lib/strapi.js";
import { splitArtistString, loadArtistCache } from "../../lib/artists.js";
import { logger } from "../../lib/logger.js";

const RAW_ITEMS_PATH = "/api/dome-of-doom-bandcamp-item-raws";
const CATALOG_ITEMS_PATH = "/api/dome-of-doom-catalog-items";
const FORMATS_PATH = "/api/dome-of-doom-formats";
const PAGE_SIZE = 100;
const WRITE_DELAY_MS = 150;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMusicRawItems() {
  // sources is a json array field - Strapi's REST filter engine doesn't
  // support $contains against json-array values (500s), so item_type is
  // filtered server-side and the sources-includes-"music" check happens
  // client-side below instead.
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      RAW_ITEMS_PATH,
      {
        "filters[item_type][$in][0]": "album",
        "filters[item_type][$in][1]": "track",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    for (const entry of res.data) {
      if (Array.isArray(entry.sources) && entry.sources.includes("music")) {
        all.push(entry);
      }
    }
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return all;
}

async function loadExistingCatalogItems() {
  const byUrl = new Map();
  let page = 1;
  while (true) {
    const res = await strapiGet(
      CATALOG_ITEMS_PATH,
      {
        "fields[0]": "bandcamp_url",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    for (const entry of res.data) {
      const url = entry.bandcamp_url ?? entry.attributes?.bandcamp_url;
      const docId = entry.documentId ?? entry.id;
      if (url) byUrl.set(url, docId);
    }
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return byUrl;
}

// ─── Formats (DomeOfDoomFormat lookup) ──────────────────────────────────────

async function loadFormatCache() {
  const byName = new Map();
  let page = 1;
  while (true) {
    const res = await strapiGet(
      FORMATS_PATH,
      { "pagination[page]": page, "pagination[pageSize]": PAGE_SIZE },
      { noCache: true }
    );
    for (const entry of res.data) {
      const name = entry.name ?? entry.attributes?.name;
      const docId = entry.documentId ?? entry.id;
      if (name) byName.set(name, docId);
    }
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return byName;
}

async function ensureFormat(cache, name) {
  if (cache.has(name)) return cache.get(name);
  const res = await strapiPost(FORMATS_PATH, { data: { name } });
  const docId = res.data?.documentId ?? res.data?.id;
  cache.set(name, docId);
  return docId;
}

function normalizeFormatName(formatType) {
  const f = (formatType || "").toLowerCase();
  if (f.includes("vinyl")) return "Vinyl";
  if (f.includes("cassette")) return "Cassette";
  if (f.includes("compact disc") || f === "cd") return "Compact Disc";
  if (f.includes("digital")) return "Digital";
  return "Other";
}

// Pure - no writes. Used for both dry-run display and as input to
// resolveFormatIds. Bandcamp's package list always includes a placeholder
// "Digital" entry even when digital purchase isn't actually enabled for a
// release - every other field on it (sku/price/availability/etc) is null,
// unlike real packages which always carry a real availability value (e.g.
// "SoldOut", "OnlineOnly"). Filtering those out is what keeps formats from
// claiming "Digital" is purchasable when it isn't.
function computeFormatNames(packages) {
  return [...new Set((packages || []).filter((p) => p.availability != null).map((p) => normalizeFormatName(p.formatType)))];
}

async function resolveFormatIds(formatCache, formatNames) {
  const ids = [];
  for (const name of formatNames) {
    ids.push(await ensureFormat(formatCache, name));
  }
  return ids;
}

// ─── Artists (DomeOfDoomArtist, roster-only matching) ───────────────────────

// raw_item.artists is always a single-entry array in practice (our
// scraper's extractArtists() only ever returns one {name, url} object),
// but that one name can itself be a comma/&-joined multi-artist string
// (e.g. "Secret Tape, Rohaan") - split every entry's name the same way
// the old discography sync does, then only link names that already match
// an existing roster artist. No stub creation: Bandcamp's /artists roster
// is the source of truth (see conversation history) - a split name with no
// roster match (e.g. "Rohaan") is just dropped, not invented.
function resolveArtistNames(rawArtists) {
  const names = new Set();
  for (const entry of rawArtists || []) {
    for (const name of splitArtistString(entry.name)) {
      names.add(name);
    }
  }
  return [...names];
}

function resolveArtistIds(artistCache, names) {
  const matched = [];
  const unmatched = [];
  for (const name of names) {
    const hit = artistCache.get(name.trim().toUpperCase());
    if (hit) matched.push(hit.docId);
    else unmatched.push(name);
  }
  return { matched, unmatched };
}

// ─── Derived field computation ──────────────────────────────────────────────

function suggestType(title, trackCount) {
  const t = (title ?? "").toLowerCase();
  if (/\bsample pack\b/.test(t)) return "sample_pack";
  if (/\b(compilation|comp)\b/.test(t)) return "compilation";
  if (/\bep\b/.test(t)) return "ep";
  if (Number.isFinite(trackCount)) {
    if (trackCount <= 3) return "single";
    if (trackCount <= 6) return "ep";
    return "album";
  }
  return "single";
}

function suggestLabelRole(title, packages) {
  if (/reissue/i.test(title ?? "")) return "reissue";

  const hasOnlineOnlyDigital = (packages || []).some(
    (p) => /digital/i.test(p.formatType || "") && p.availability === "OnlineOnly"
  );
  if (hasOnlineOnlyDigital) return "original";

  const hasPhysical = (packages || []).some((p) => /vinyl|cassette|compact disc/i.test(p.formatType || ""));
  if (hasPhysical) return "physical";

  return "other";
}

// ─── Orchestration ────────────────────────────────────────────────────────

export async function backfillCatalogItems({ dryRun = false } = {}) {
  if (dryRun) logger.info("[domeofdoomCatalogItems] --- DRY RUN, no writes will be made ---");

  logger.info("[domeofdoomCatalogItems] loading music raw items from Strapi...");
  const rawItems = await fetchMusicRawItems();
  logger.info(`[domeofdoomCatalogItems] ${rawItems.length} music raw item(s) (album/track, sources includes music)`);

  logger.info("[domeofdoomCatalogItems] loading existing catalog items + format cache + artist cache...");
  const [existing, formatCache, artistCache] = await Promise.all([
    loadExistingCatalogItems(),
    loadFormatCache(),
    loadArtistCache(),
  ]);
  logger.info(
    `[domeofdoomCatalogItems] ${existing.size} existing catalog item(s), ${formatCache.size} known format(s), ` +
    `${artistCache.size} known artist(s)`
  );

  const stats = { created: 0, updated: 0, failed: 0 };
  const unmatchedArtistNames = new Set();

  for (const rawItem of rawItems) {
    const bandcampUrl = rawItem.bandcamp_url ?? rawItem.attributes?.bandcamp_url;
    const rawDocId = rawItem.documentId ?? rawItem.id;
    if (!bandcampUrl) continue;

    const title = rawItem.name;
    const packages = rawItem.packages || [];
    const trackCount = Array.isArray(rawItem.tracks) ? rawItem.tracks.length : null;
    const formatNames = computeFormatNames(packages);
    const artistNames = resolveArtistNames(rawItem.artists);
    const { matched: artistIds, unmatched: unmatchedNames } = resolveArtistIds(artistCache, artistNames);
    unmatchedNames.forEach((n) => unmatchedArtistNames.add(n));

    try {
      // Dry-run computes and logs the same format names but never calls
      // ensureFormat, so it can't create real DomeOfDoomFormat records.
      const formatIds = dryRun ? [] : await resolveFormatIds(formatCache, formatNames);

      const payload = {
        bandcamp_url: bandcampUrl,
        raw_item: rawDocId,
        derived: {
          title,
          description: rawItem.description ?? null,
          artwork_url: rawItem.artwork_url ?? null,
          release_date: rawItem.release_date ?? null,
          publish_date: rawItem.publish_date ?? null,
          artists: artistIds,
          suggested_type: suggestType(title, trackCount),
          formats: formatIds,
          label_role: suggestLabelRole(title, packages),
          packages: rawItem.packages ?? null,
          tracks: rawItem.tracks ?? null,
        },
      };

      const existingDocId = existing.get(bandcampUrl);

      if (dryRun) {
        logger.info(
          `[domeofdoomCatalogItems] [dry] would ${existingDocId ? "update" : "create"} "${title}" ` +
          `(suggested_type=${payload.derived.suggested_type}, label_role=${payload.derived.label_role}, ` +
          `formats=[${formatNames.join(", ")}], artists=[${artistNames.filter((n) => !unmatchedNames.includes(n)).join(", ")}]` +
          (unmatchedNames.length ? `, unmatched_artists=[${unmatchedNames.join(", ")}]` : "") +
          `)`
        );
      } else if (existingDocId) {
        await strapiPut(`${CATALOG_ITEMS_PATH}/${existingDocId}`, { data: payload });
      } else {
        await strapiPost(CATALOG_ITEMS_PATH, { data: payload });
      }

      if (existingDocId) stats.updated++;
      else stats.created++;
    } catch (err) {
      logger.error(`[domeofdoomCatalogItems] failed to sync "${bandcampUrl}":`, err.message);
      stats.failed++;
    }

    await sleep(WRITE_DELAY_MS);
  }

  logger.info(
    `[domeofdoomCatalogItems] complete: ${stats.created} created, ${stats.updated} updated, ${stats.failed} failed`
  );
  if (unmatchedArtistNames.size > 0) {
    logger.info(
      `[domeofdoomCatalogItems] ${unmatchedArtistNames.size} artist name(s) had no roster match, dropped: ` +
      [...unmatchedArtistNames].sort().join(", ")
    );
  }

  return stats;
}
