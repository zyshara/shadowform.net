// server/cron/domeofdoom/backfillArtistSpotify.js
//
// Backfills DomeOfDoomArtist.derived.spotify_url (and, where possible,
// .spotify_description) for any artist that doesn't already have one.
//
// Matching is name-only for now (no Google-search corroboration yet - see
// conversation history): searches Spotify's artist search and only accepts
// an exact normalized name match. No exact match -> left unresolved rather
// than guessing off a fuzzy one, same "don't invent data" rule used
// throughout this pipeline. Ambiguous/no-match artists are candidates for
// a future corroboration pass, not silently wrong data today.
//
// spotify_description is a documented no-op right now: verified directly
// against Spotify's Web API (both /search and /artists/{id}) that neither
// endpoint exposes an artist bio/description field at all - there's simply
// nothing to resolve until we have another source for this text.

import { spotifyGet, parseSpotifyArtistId } from "../../lib/spotify.js";
import { strapiGet, strapiPut } from "../../lib/strapi.js";
import { logger } from "../../lib/logger.js";

const ARTISTS_PATH = "/api/dome-of-doom-artists";
const PAGE_SIZE = 100;
const WRITE_DELAY_MS = 150;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeArtistName(s) {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function fetchArtistsFromStrapi() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await strapiGet(
      ARTISTS_PATH,
      {
        populate: "derived",
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

// Exact normalized-name match only - see file header for why.
async function resolveSpotifyUrl(name) {
  if (!name) return null;

  const wantName = normalizeArtistName(name);
  const result = await spotifyGet(`/search?q=${encodeURIComponent(name)}&type=artist&limit=10`);
  const candidates = result?.artists?.items ?? [];

  const match = candidates.find((c) => normalizeArtistName(c.name) === wantName);
  if (!match) return null;

  return {
    id: match.id,
    url: match.external_urls?.spotify ?? null,
  };
}

// No-op for now - Spotify's public Web API doesn't expose an artist
// bio/description on either /search or /artists/{id} (verified directly).
// Kept as its own function so a future source (once we have one) plugs in
// here without changing the orchestration below.
async function resolveSpotifyDescription(_spotifyArtistId) {
  return null;
}

// Strips the component's own `id` before sending it back - Strapi returns
// that on read, but re-including it isn't needed to target the existing
// component instance and keeping it out avoids any ambiguity on write.
function withDerivedUpdates(derived, updates) {
  const { id, ...rest } = derived || {};
  return { ...rest, ...updates };
}

export async function backfillArtistSpotify({ dryRun = false } = {}) {
  if (dryRun) logger.info("[domeofdoomSpotify] --- DRY RUN, no writes will be made ---");

  logger.info("[domeofdoomSpotify] loading artists from Strapi...");
  const artists = await fetchArtistsFromStrapi();
  logger.info(`[domeofdoomSpotify] ${artists.length} artist(s) loaded`);

  const stats = { urlResolved: 0, urlSkipped: 0, urlNoMatch: 0, descriptionResolved: 0, failed: 0 };

  for (const artist of artists) {
    const derived = artist.derived ?? {};
    const name = derived.name ?? artist.name;
    let spotifyUrl = derived.spotify_url ?? null;
    let spotifyId = spotifyUrl ? parseSpotifyArtistId(spotifyUrl) : null;

    try {
      if (!spotifyUrl) {
        const match = await resolveSpotifyUrl(name);
        if (match?.url) {
          spotifyUrl = match.url;
          spotifyId = match.id;
          if (dryRun) {
            logger.info(`[domeofdoomSpotify] [dry] would set spotify_url for "${name}" -> ${spotifyUrl}`);
          } else {
            await strapiPut(`${ARTISTS_PATH}/${artist.documentId}`, {
              data: { derived: withDerivedUpdates(derived, { spotify_url: spotifyUrl }) },
            });
            logger.info(`[domeofdoomSpotify] resolved spotify_url for "${name}" -> ${spotifyUrl}`);
          }
          derived.spotify_url = spotifyUrl;
          stats.urlResolved++;
        } else {
          stats.urlNoMatch++;
          logger.info(`[domeofdoomSpotify] [no match] "${name}"`);
        }
        await sleep(WRITE_DELAY_MS);
      } else {
        stats.urlSkipped++;
      }

      if (spotifyUrl && !derived.spotify_description) {
        const description = await resolveSpotifyDescription(spotifyId);
        if (description) {
          if (dryRun) {
            logger.info(`[domeofdoomSpotify] [dry] would set spotify_description for "${name}"`);
          } else {
            await strapiPut(`${ARTISTS_PATH}/${artist.documentId}`, {
              data: { derived: withDerivedUpdates(derived, { spotify_description: description }) },
            });
          }
          stats.descriptionResolved++;
          await sleep(WRITE_DELAY_MS);
        }
      }
    } catch (err) {
      logger.error(`[domeofdoomSpotify] failed to resolve "${name}":`, err.message);
      stats.failed++;
    }
  }

  logger.info(
    `[domeofdoomSpotify] complete: ${stats.urlResolved} url resolved, ${stats.urlSkipped} already set, ` +
    `${stats.urlNoMatch} no match, ${stats.descriptionResolved} description resolved, ${stats.failed} failed`
  );

  return stats;
}
