// server/domeofdoom/cron/scrapeBandcampAndSyncStrapi.js
//
// Scrapes the Dome of Doom Bandcamp catalog + artist roster via
// dod-bandcamp-scraper and upserts everything into Strapi:
//   - catalog/merch items -> DomeOfDoomBandcampItemRaw (Layer 1, keyed by
//     bandcamp_url - a straight, idempotent mirror of the scrape)
//   - artists -> DomeOfDoomArtist's bandcamp_raw_data + derived fields
//     (matched by name, not bandcamp_url - see syncArtists for why)
// Existing records are overwritten in place; new ones are created.
// Layer 2/3 derivation for catalog items reads from the raw table
// separately and is not this module's concern.

import { scrapeCatalog, scrapeArtists } from "dod-bandcamp-scraper";
import { strapiGetAllPages, strapiPost, strapiPut } from "#lib/strapi.js";
import { createLogger } from "#lib/logger.js";
const log = createLogger("domeofdoom");

const RAW_ITEMS_PATH = "/api/dome-of-doom-bandcamp-item-raws";
const ARTISTS_PATH = "/api/dome-of-doom-artists";
const WRITE_DELAY_MS = 150;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Catalog/merch items (DomeOfDoomBandcampItemRaw) ────────────────────────

async function loadExistingRawItems() {
  const entries = await strapiGetAllPages(RAW_ITEMS_PATH, { "fields[0]": "bandcamp_url" });

  const byUrl = new Map();
  for (const entry of entries) {
    const url = entry.bandcamp_url ?? entry.attributes?.bandcamp_url;
    const docId = entry.documentId ?? entry.id;
    if (url) byUrl.set(url, docId);
  }
  return byUrl;
}

// Maps the scraper's camelCase output to this project's snake_case Strapi
// attribute convention (see dome-of-doom-release for precedent).
function toRawPayload(release) {
  return {
    bandcamp_url: release.bandcampUrl,
    item_type: release.itemType,
    slug: release.slug,
    name: release.name,
    artists: release.artists,
    release_date: release.bandcampReleaseDate,
    publish_date: release.bandcampPublishDate,
    description: release.description,
    credits: release.credits,
    license: release.license,
    tags: release.tags,
    artwork_url: release.artworkUrl,
    tracks: release.tracks,
    packages: release.packages,
    sources: release.sources,
    scraped_at: release.scrapedAt,
  };
}

async function syncCatalogItems() {
  log.info("syncCatalogItems", "scraping catalog...");
  const output = await scrapeCatalog();
  log.info("syncCatalogItems",
    `catalog scrape complete: ${output.scrapeMetadata.successCount} items, ${output.scrapeMetadata.errorCount} errors`
  );

  log.info("syncCatalogItems", "loading existing raw items from Strapi...");
  const existing = await loadExistingRawItems();
  log.info("syncCatalogItems", `${existing.size} existing raw item(s) in Strapi`);

  const stats = { created: 0, updated: 0, failed: 0 };

  for (const release of output.releases) {
    const payload = toRawPayload(release);
    const existingDocId = existing.get(release.bandcampUrl);

    try {
      if (existingDocId) {
        await strapiPut(`${RAW_ITEMS_PATH}/${existingDocId}`, { data: payload });
        stats.updated++;
      } else {
        await strapiPost(RAW_ITEMS_PATH, { data: payload });
        stats.created++;
      }
    } catch (err) {
      log.error("syncCatalogItems", `failed to sync "${release.name}" (${release.bandcampUrl}):`, err);
      stats.failed++;
    }

    await sleep(WRITE_DELAY_MS);
  }

  log.info("syncCatalogItems",
    `catalog sync complete: ${stats.created} created, ${stats.updated} updated, ${stats.failed} failed`
  );

  return { scrape: output.scrapeMetadata, sync: stats };
}

// ─── Artists (DomeOfDoomArtist) ──────────────────────────────────────────────

// Matched by name, not bandcamp_url: DomeOfDoomArtist already has 99
// existing records created by the older syncDiscography.js flow
// (server/domeofdoom/artists.js's ensureArtist/loadArtistCache), all with
// bandcamp_url unset - matching on URL here would create a duplicate for
// every artist that already exists. Same normalization (trim + uppercase)
// as that existing flow, so this merges into the same records instead.
async function loadExistingArtistsByName() {
  const entries = await strapiGetAllPages(ARTISTS_PATH, { "fields[0]": "name" });

  const byName = new Map();
  for (const entry of entries) {
    const name = (entry.name ?? entry.attributes?.name ?? "").trim();
    const docId = entry.documentId ?? entry.id;
    if (name) byName.set(name.toUpperCase(), docId);
  }
  return byName;
}

function toArtistPayload(artist) {
  return {
    bandcamp_raw_data: artist,
    derived: {
      name: artist.name,
      bandcamp_url: artist.bandcampUrl,
      bandcamp_image: artist.imageUrl,
    },
  };
}

async function syncArtists() {
  log.info("syncArtists", "scraping artists...");
  const output = await scrapeArtists();
  log.info("syncArtists", `artist scrape complete: ${output.artists.length} artists`);

  log.info("syncArtists", "loading existing artists from Strapi...");
  const existing = await loadExistingArtistsByName();
  log.info("syncArtists", `${existing.size} existing artist(s) in Strapi`);

  const stats = { created: 0, updated: 0, failed: 0 };

  for (const artist of output.artists) {
    const key = artist.name.trim().toUpperCase();
    const existingDocId = existing.get(key);

    try {
      if (existingDocId) {
        await strapiPut(`${ARTISTS_PATH}/${existingDocId}`, { data: toArtistPayload(artist) });
        stats.updated++;
      } else {
        await strapiPost(ARTISTS_PATH, { data: { name: artist.name, ...toArtistPayload(artist) } });
        stats.created++;
      }
    } catch (err) {
      log.error("syncArtists", `failed to sync artist "${artist.name}":`, err);
      stats.failed++;
    }

    await sleep(WRITE_DELAY_MS);
  }

  log.info("syncArtists",
    `artist sync complete: ${stats.created} created, ${stats.updated} updated, ${stats.failed} failed`
  );

  return { scrape: output.scrapeMetadata, sync: stats };
}

// ─── Orchestration ────────────────────────────────────────────────────────

export async function scrapeBandcampAndSyncStrapi() {
  const catalog = await syncCatalogItems();
  const artists = await syncArtists();
  return { catalog, artists };
}
