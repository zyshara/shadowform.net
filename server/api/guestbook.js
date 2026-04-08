// server/api/guestbook.js

import { strapiGet, strapiPost, strapiUploadMedia, strapiPut, invalidateCache } from "../lib/strapi.js";
import { normalizeEntry, normalizeGuestbook } from "../models/guestbook.js";

// ── config ────────────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX       = 3;               // posts per IP per window
const TAG_CACHE_TTL        = 5 * 60 * 1000;  // 5 minutes

// ── IP rate limiter ───────────────────────────────────────────────────────────
const rateLimitStore = new Map();

function checkRateLimit(ip) {
  const now   = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 60) };
  }
  entry.count++;
  return { allowed: true };
}

// Prune stale entries hourly
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

// ── tag cache — fetched from Guestbook single type ────────────────────────────
// Shape: [{ id, label }]
let cachedTags       = null;
let cachedTagsExpiry = 0;

async function getValidTags() {
  if (cachedTags && Date.now() < cachedTagsExpiry) return cachedTags;
  try {
    const data = await strapiGet("/api/guestbook", {
      "populate": "allowed_guestbook_tags",
    });
    const guestbook = data.data ?? {};
    const tags = (guestbook.allowed_guestbook_tags ?? [])
      .map((a) => ({ id: a.id, label: a.label, theme: a.theme }));
    cachedTags       = tags;
    cachedTagsExpiry = Date.now() + TAG_CACHE_TTL;
    return cachedTags;
  } catch (err) {
    console.error("[guestbook] getValidTags failed:", err.message);
    return cachedTags ?? [];
  }
}

// ── register routes ───────────────────────────────────────────────────────────
export function registerGuestbookRoutes(app, express) {

  // GET /api/guestbook
  app.get("/api/guestbook", async (req, res) => {
    try {
      const data = await strapiGet("/api/guestbook", {
        "populate[allowed_guestbook_tags]":       "*",
        "populate[guestbook_entries][populate]":  "*",
      });
      
      const guestbook = normalizeGuestbook(data.data);
      res.json({ guestbook });
    } catch (err) {
      console.error("[guestbook] GET /api/guestbook failed:", err.message);
      console.error("[guestbook] GET failed body:", err.body);
      res.status(502).json({ error: err.message });
    }
  });

  // GET /api/guestbook/tags
   app.get("/api/guestbook/tags", async (req, res) => {
    try {
      const tags = await getValidTags();
      res.json({ tags });
    } catch (err) {
      console.error("[guestbook] GET /api/guestbook/tags failed:", err.message);
      res.status(502).json({ error: err.message });
    }
  });

  // POST /api/guestbook
  // Creates a new GuestbookEntry
  app.post("/api/guestbook", express.json({ limit: "4mb" }), async (req, res) => {

    // ── rate limit ──────────────────────────────────────────────────────────
    const ip = (req.headers["x-forwarded-for"] ?? "").split(",")[0].trim()
               || req.socket.remoteAddress
               || "unknown";

    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.retryAfter * 60));
      return res.status(429).json({
        error: `too many posts — try again in ${rate.retryAfter} minutes`,
      });
    }

    // ── validate body ───────────────────────────────────────────────────────
    const { name, website, message, tags = [], drawing = null } = req.body ?? {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    if (name.trim().length > 80) {
      return res.status(400).json({ error: "name is too long (max 80 chars)" });
    }
    if (message && message.length > 500) {
      return res.status(400).json({ error: "message is too long (max 500 chars)" });
    }

    // ── validate tags against Guestbook allowed_guestbook_tags ─────────────
    const validIds = new Set((await getValidTags() ?? []).map(t => t.id));

    const cleanTagIds = (tags ?? [])
      .map(t => t.id)
      .filter(id => validIds.has(id));

    // ── handle drawing ────────────────────────────────────────────────────────────
    let drawingMediaId = null;

    if (drawing && typeof drawing === "string" && drawing.startsWith("data:image/png;base64,")) {
      try {
        const buffer = Buffer.from(drawing.split(",")[1], "base64");
        const file   = await strapiUploadMedia(buffer, `drawing-${Date.now()}.png`);
        drawingMediaId = file?.id ?? null;
      } catch (uploadErr) {
        console.warn("[guestbook] drawing upload failed:", uploadErr.message);
        // non-fatal — entry still posts without the drawing
      }
    }
    // ── post to Strapi ──────────────────────────────────────────────────────
    try {
      const payload = {
        data: {
          name:            name.trim().slice(0, 80),
          website:         website?.trim().slice(0, 200) || null,
          message:         message?.trim().slice(0, 500) || null,
          date_posted:     new Date().toISOString(),
          ip_address:      ip,
          guestbook_tags: cleanTagIds,
          ...(drawingMediaId && { drawing: drawingMediaId }),
        },
      };

      const saved = await strapiPost("/api/guestbook-entries", payload);
      const entry = normalizeEntry(saved.data ?? saved);

      const entryId    = saved.data?.id ?? saved.id;
      const documentId = saved.data?.documentId ?? saved.documentId;
      
      // Connect the new entry to the Guestbook single type relation
      await strapiPut("/api/guestbook", {
        data: { guestbook_entries: { connect: [documentId] } },  // numeric id for relations
      });

      // Re-fetch entry to get populated tags + drawing url
      const full = await strapiGet(`/api/guestbook-entries/${documentId}`, {
        "populate[guestbook_tags]":   "*",
        "populate[drawing][fields]":  "*",
      });
      const fullEntry = normalizeEntry(full.data ?? full);

      invalidateCache();

      res.status(201).json({ entry: fullEntry });
    } catch (err) {
      console.error("[guestbook] POST failed:", err.message, err.body ?? "");
      res.status(502).json({ error: "failed to save entry" });
    }
  });
}
