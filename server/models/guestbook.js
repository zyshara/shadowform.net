// ── word blacklist ────────────────────────────────────────────────────────────
const BLACKLIST = [
  // add words here — redacted with █ on display, stored raw in strapi
];

const BLACKLIST_RE = BLACKLIST.length
  ? new RegExp(`\\b(${BLACKLIST.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi")
  : null;

function redact(str) {
  if (!str || !BLACKLIST_RE) return str;
  return str.replace(BLACKLIST_RE, (m) => "█".repeat(m.length));
}

/**
 * Maps a raw Strapi GuestbookEntry → the shape the client expects.
 * Returns null for entries missing required fields (filtered out by callers).
 */
export function normalizeEntry(raw) {
  if (!raw.id || !raw.name || !raw.date_posted) return null;

  return {
    id:      raw.id,
    name:    redact(raw.name ?? ""),
    website: raw.website ?? null,
    message: redact(raw.message ?? ""),
    drawing: raw.drawing?.url ?? null,
    _ts:     new Date(raw.date_posted).getTime(), // raw timestamp for sorting
    date:    raw.date_posted ? new Date(raw.date_posted).toLocaleDateString("en-CA").replace(/-/g, ".") : null,
    tags:    raw.guestbook_tags?.map((a) => ({ label: a.label, theme: a.theme })),
  };
}

/**
 * Maps a raw Strapi Guestbook single-type → the shape the client expects.
 * Entries are sorted newest-first.
 */
export function normalizeGuestbook(raw) {
  return {
    allowed_tags: (raw.allowed_guestbook_tags ?? []).map((a) => a.label),
    guestbook_entries: (raw.guestbook_entries ?? [])
      .map(normalizeEntry)
      .filter(Boolean)
      .sort((a, b) => new Date(b._ts) - new Date(a._ts)),
  };
}
