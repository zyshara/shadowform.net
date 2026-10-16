// server/lib/sanitize.js
//
// Shared input sanitization for public user-submitted text (contact form,
// guestbook, ...).

// Strips null bytes and any HTML tags, then trims. Doesn't HTML-escape —
// callers that render this as HTML still need to escape it there; this
// just stops someone embedding markup in stored text.
export function sanitize(val) {
  if (typeof val !== "string") return "";
  return val.replace(/\x00/g, "").replace(/<[^>]*>/g, "").trim();
}

// Sanitizes a URL field and only keeps it if it's an http(s) URL — blocks
// javascript:/data:/etc. schemes that would execute if the value is later
// rendered as a clickable link (<a href>) with no further validation.
export function sanitizeUrl(val) {
  const cleaned = sanitize(val);
  if (!cleaned) return "";
  try {
    const url = new URL(cleaned);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return cleaned;
  } catch {
    return "";
  }
}
