// server/lib/artists.js
//
// Shared helpers for splitting Bandcamp's free-text `artist` field into
// individual artist names and resolving/creating their Dome of Doom Artist
// entries in Strapi. Used by both the discography sync cron job and the
// one-off backfill script so the split rules never drift between them.

import { strapiGet, strapiPost } from "./strapi.js";

const ARTISTS_PATH = "/api/dome-of-doom-artists";
const PAGE_SIZE = 100;

// Split "DMVU, Finnoh" / "DMVU & FINNOH" / "ZOF, DMVU, Babyweight" / "A x B"
// into individual artist names (case-insensitive separators).
export function splitArtistString(str) {
  if (!str) return [];
  const norm = str.trim();
  if (!norm || norm.toUpperCase() === "DOMEOFDOOM") return [];
  return norm
    .split(/\s*,\s*|\s+&\s+|\s+[xX]\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Explicit substitutions for stylized "symbol standing in for a letter"
// branding - e.g. the roster's own "(DJ) NOBOD¥" uses ¥ for Y. Generic
// Unicode normalization (see slugifyArtistName below) handles ACCENTED
// letters fine (á -> a, ñ -> n) since that's a real decomposition rule,
// but a symbol standing in for an unrelated letter has no such rule - it
// has to be a manual lookup. Only add an entry here once you've actually
// confirmed by hand it's meant to read as that letter; guessing (e.g.
// assuming every "$" means "S") risks silently merging two different
// artists under one slug.
const SYMBOL_SUBSTITUTIONS = {
  "¥": "y",
};

// Normalizes an artist name down to a duplicate-matching key - NOT for
// display, only for "is this the same artist as that other string".
// Strips accents via Unicode decomposition, swaps known stylized symbols
// (SYMBOL_SUBSTITUTIONS), lowercases, then strips everything left that
// isn't a letter or digit (spaces, punctuation, any other symbol).
// Deliberately aggressive - two names that collide to the same slug are
// assumed to be the same artist.
export function slugifyArtistName(name) {
  if (!name) return "";
  let s = name;
  for (const [symbol, letter] of Object.entries(SYMBOL_SUBSTITUTIONS)) {
    s = s.split(symbol).join(letter);
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Bandcamp "someone reinterpreted this track" credits show up as Remix,
// Flip, and VIP (checked against real catalog data before adding these -
// "Edit" also appears once, as "Happy Feey (airplane edit)", but that
// reads like a generic descriptor (c.f. "radio edit") rather than a
// person's name, and there's no second example to confirm either way -
// deliberately left out rather than guessed at).
const REINTERPRET_KEYWORDS = "remix|flip|vip";

// Full form: "OriginalArtist - Song Title (Reinterpreter Remix/Flip/VIP)" -
// track.artist is just whatever's before that first " - ", i.e. the
// ORIGINAL artist being reinterpreted, not someone Dome of Doom
// necessarily worked with directly (see "Ray Keith - Dark Soldier
// (Daedelus Remix)" on Wears House: Ray Keith is the source track's
// artist, Daedelus is who actually made the release).
// The dash needs at least one real space on each side - a bare "-" with
// no surrounding whitespace also matches the hyphen INSIDE a single
// hyphenated artist name (e.g. "L-Gauge (RamonPang Remix)" would wrongly
// split into "L" + "Gauge" without this).
const REINTERPRET_WITH_ORIGINAL_RE = new RegExp(
  `^(.+?)\\s+-\\s+.+\\(([^()]+?)\\s+(?:${REINTERPRET_KEYWORDS})\\)\\s*$`,
  "i"
);

// Suffix-only form: "Song Title (Reinterpreter Remix/Flip/VIP)" - no dash,
// so there's no embedded "original artist" name to strip out (track.artist
// is independent info in this form, not duplicated in the title). A bare
// "(VIP)" with nothing before the keyword - the ORIGINAL artist's own
// alternate version, no third party involved - correctly fails to match
// either pattern, since both require at least one character captured
// before the keyword.
const REINTERPRET_SUFFIX_ONLY_RE = new RegExp(`\\(([^()]+?)\\s+(?:${REINTERPRET_KEYWORDS})\\)\\s*$`, "i");

// reinterpreterClause can itself be multi-artist ("Artist1 & Artist2
// Remix") so it still goes through splitArtistString like every other
// name from this module.
export function parseReinterpretationCredit(trackTitle) {
  if (!trackTitle) return null;
  const withOriginal = trackTitle.match(REINTERPRET_WITH_ORIGINAL_RE);
  if (withOriginal) return { originalArtistRaw: withOriginal[1].trim(), reinterpreterClause: withOriginal[2].trim() };
  const suffixOnly = trackTitle.match(REINTERPRET_SUFFIX_ONLY_RE);
  if (suffixOnly) return { originalArtistRaw: null, reinterpreterClause: suffixOnly[1].trim() };
  return null;
}

// Extracts every candidate artist name from a raw DomeOfDoomBandcampItemRaw
// - both the release-level `artists` field AND `tracks[].artist` (never
// mined before this), applying the remix/flip/VIP-credit filtering above.
// A track's pre-dash "original artist" credit is excluded UNLESS it's also
// independently confirmed elsewhere on this SAME item (the release's own
// artists field, or a different, non-remix-credit track) - e.g. on
// Wears House, "Ray Keith - Dark Soldier (Daedelus Remix)" correctly
// excludes Ray Keith (never appears anywhere else on that release) while
// still surfacing Daedelus (the actual remixer, and the release's real
// artist). Scoped to just this one item deliberately - whether a name is
// a genuine collaborator on THIS release shouldn't depend on it
// coincidentally matching some unrelated artist/credit on another release.
export function resolveArtistNamesFromRawItem(rawItem) {
  const confirmed = new Set();
  const remixCreditOnly = new Set();

  for (const entry of rawItem.artists ?? []) {
    for (const name of splitArtistString(entry.name)) confirmed.add(name);
  }

  for (const track of rawItem.tracks ?? []) {
    const remix = parseReinterpretationCredit(track.title);
    if (remix) {
      if (remix.originalArtistRaw) {
        for (const name of splitArtistString(remix.originalArtistRaw)) remixCreditOnly.add(name);
      } else if (track.artist) {
        for (const name of splitArtistString(track.artist)) confirmed.add(name);
      }
      for (const name of splitArtistString(remix.reinterpreterClause)) confirmed.add(name);
    } else {
      for (const name of splitArtistString(track.artist)) confirmed.add(name);
    }
  }

  const confirmedSlugs = new Set([...confirmed].map(slugifyArtistName));
  for (const name of remixCreditOnly) {
    if (confirmedSlugs.has(slugifyArtistName(name))) confirmed.add(name);
  }

  return [...confirmed];
}

// Loads all existing Dome of Doom Artist entries into a map, keyed BOTH by
// name.toUpperCase() (the original key format - existing callers that do
// cache.get(name.trim().toUpperCase()) directly keep working unchanged)
// AND by slugifyArtistName(name) (better matching: catches casing,
// punctuation, and accent variants the uppercase key alone would miss,
// e.g. "(DJ) NOBOD¥" / "DJ Nobody" both slug to "djnobody"). Both keys on
// a given artist point at the same { docId, name } object.
export async function loadArtistCache() {
  const cache = new Map();
  let page = 1;
  while (true) {
    const res = await strapiGet(
      ARTISTS_PATH,
      {
        "fields[0]": "name",
        "pagination[page]": page,
        "pagination[pageSize]": PAGE_SIZE,
      },
      { noCache: true }
    );
    for (const a of res.data) {
      const name = (a.name ?? a.attributes?.name ?? "").trim();
      const docId = a.documentId ?? a.id;
      if (!name) continue;
      const entry = { docId, name };
      cache.set(name.toUpperCase(), entry);
      const slug = slugifyArtistName(name);
      if (slug) cache.set(slug, entry);
    }
    if (page >= res.meta.pagination.pageCount) break;
    page++;
  }
  return cache;
}

// Returns the documentId for an artist name, creating it in Strapi (with
// its slug set) if missing. Also sets derived.name, matching the
// convention scrapeBandcampAndSyncStrapi.js's toArtistPayload uses for
// roster-scraped artists (name duplicated onto both the top-level field
// AND derived.name) - artists created here have no scraped
// bandcamp_url/bandcamp_image to fill in the rest of `derived` with, so
// only name is set.
export async function ensureArtist(cache, rawName) {
  const name = rawName.trim();
  const key = name.toUpperCase();
  if (cache.has(key)) return cache.get(key).docId;

  const slug = slugifyArtistName(name);
  const res = await strapiPost(ARTISTS_PATH, { data: { name, slug, derived: { name } } });
  const docId = res.data?.documentId ?? res.documentId;
  const entry = { docId, name };
  cache.set(key, entry);
  if (slug) cache.set(slug, entry);
  return docId;
}
