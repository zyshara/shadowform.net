// server/lib/releaseMatching.js
//
// Matches a scraped Bandcamp release to a Spotify album, and classifies its
// release type. Both were tuned against 9 real Dome of Doom releases (see
// conversation history) before being written — every rule below exists
// because a naive version got a specific real release wrong.

import { spotifyGet } from "./spotify.js";

// Spotify sometimes ships an album name without Bandcamp's own trailing
// format suffix (e.g. Bandcamp "RICO EP" -> Spotify "RICO"). Doesn't touch
// words like "remix"/"remixed" — those are kept verbatim in Spotify's own
// names (e.g. "Be Real (Mat Zo Remix)" matches Spotify exactly, untouched).
function normalizeTitle(s) {
  return (s ?? "")
    .replace(/\s+(EP|LP)$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeArtist(s) {
  return (s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function searchAlbums(query) {
  const result = await spotifyGet(`/search?q=${encodeURIComponent(query)}&type=album&limit=10`);
  return result?.albums?.items ?? [];
}

function findAcceptableMatch(items, { wantArtist, wantTitle, requireCompilation }) {
  for (const album of items) {
    if (normalizeTitle(album.name) !== wantTitle) continue;

    if (requireCompilation) {
      if (album.album_type === "compilation") return album;
      continue;
    }

    if (normalizeArtist(album.artists?.[0]?.name) === wantArtist) return album;
  }
  return null;
}

function toMatch(album) {
  return {
    spotify_url: album.external_urls?.spotify ?? null,
    album_type: album.album_type,
    total_tracks: album.total_tracks,
    release_date: album.release_date ?? null,
  };
}

// Releases attributed directly to the label's own Bandcamp account are
// always various-artist compilations — searching "DOMEOFDOOM <title>" floods
// results with unrelated DOOM-the-video-game soundtracks (the label name
// contains "doom"), so those skip straight to a title-only search gated on
// Spotify's own album_type === "compilation" instead of an artist match.
const LABEL_ARTIST_NAME = "DOMEOFDOOM";

export async function matchSpotifyRelease({ artist, release_name }) {
  const wantArtist = normalizeArtist(artist);
  const wantTitle = normalizeTitle(release_name);
  const isLabelAccount = artist === LABEL_ARTIST_NAME;

  if (!isLabelAccount) {
    const primary = await searchAlbums(`${artist} ${release_name}`);
    const hit = findAcceptableMatch(primary, { wantArtist, wantTitle, requireCompilation: false });
    if (hit) return toMatch(hit);
  }

  // Fallback for everything else: label compilations (by design, above), and
  // a second chance for a normal release whose artist+title search missed
  // (still gated on the artist actually matching, not just the title).
  const titleOnly = await searchAlbums(release_name);
  const hit = findAcceptableMatch(titleOnly, {
    wantArtist,
    wantTitle,
    requireCompilation: isLabelAccount,
  });

  return hit ? toMatch(hit) : null;
}

// Priority order, first match wins:
//  1-3. Title keywords — an explicit human-written descriptor beats any
//       inference from the (possibly missing) Spotify match.
//  4. Spotify's own album_type — only trusted for "compilation" (its
//     single/album values don't distinguish Single from EP; Spotify derives
//     that distinction for its own UI from track count, not this field —
//     see the EP-classification research earlier in this project).
//  5. Track count from the matched Spotify album, using Spotify's own
//     published thresholds (1-3 Single, 4-6 EP, 7+ Album).
//  6. No keyword and no Spotify match at all: nothing to go on. Defaults to
//     Single as the most common shape for a short, unlabeled release — a
//     real guess, not a derived fact, since this project intentionally
//     doesn't fetch each Bandcamp release's own page for a track count.
export function classifyReleaseType({ release_name, spotifyAlbumType, totalTracks }) {
  const title = (release_name ?? "").toLowerCase();

  if (/\b(compilation|comp)\b/.test(title)) return "Compilation";
  if (/\b(remix|rmx)/.test(title)) return "Remix"; // no trailing \b — must also catch "remixes"/"remixed"
  if (/\bep\b/.test(title)) return "EP";

  if (spotifyAlbumType === "compilation") return "Compilation";

  if (Number.isFinite(totalTracks)) {
    if (totalTracks <= 3) return "Single";
    if (totalTracks <= 6) return "EP";
    return "Album";
  }

  return "Single";
}
