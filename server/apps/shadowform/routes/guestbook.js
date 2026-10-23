import { jsonBody } from "#middleware/jsonBody.js";
// server/apps/shadowform/routes/guestbook.js

import { strapiGet, strapiPost, strapiUploadMedia, strapiPut, invalidateCache } from "#lib/strapi.js";
import { normalizeEntry } from "#apps/shadowform/models/guestbook.js";
import { createLogger } from "#lib/logger.js";
const log = createLogger("shadowform");
import { rateLimit } from "#lib/rateLimit.js";
import { sanitize, sanitizeUrl } from "#lib/sanitize.js";

// ── config ────────────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX       = 3;               // posts per IP per window

const limit = rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX });

async function getValidTags() {
  const response = await strapiGet("/api/guestbook", { populate: "allowed_guestbook_tags" });
  return response.data?.allowed_guestbook_tags ?? [];
}

// ── register routes ───────────────────────────────────────────────────────────
export function registerGuestbookRoutes(app) {

  // POST /api/guestbook
  // Creates a new GuestbookEntry
  app.post("/api/guestbook", limit, jsonBody({ limit: "4mb", tooLarge: "drawing is too large (max 2 MB PNG)" }), async function submitGuestbook(req, res) {

    const ip = req.ip || req.socket?.remoteAddress || "unknown";

    // ── validate body ───────────────────────────────────────────────────────
    const { tags = [], drawing = null } = req.body ?? {};
    const name    = sanitize(req.body?.name);
    const message = sanitize(req.body?.message);
    // Not HTML — rendered as a raw <a href>, so this needs scheme
    // validation (blocks javascript:/data:/etc.), not just tag-stripping.
    const website = sanitizeUrl(req.body?.website);

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    if (name.length > 80) {
      return res.status(400).json({ error: "name is too long (max 80 chars)" });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: "message is too long (max 500 chars)" });
    }
    if (!Array.isArray(tags)) return res.status(400).json({ error: "invalid tags" });

    let drawingBuffer = null;
    if (drawing != null) {
      if (typeof drawing !== "string" || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(drawing)) {
        return res.status(400).json({ error: "drawing must be a PNG image" });
      }
      drawingBuffer = Buffer.from(drawing.slice("data:image/png;base64,".length), "base64");
      if (drawingBuffer.length > 2 * 1024 * 1024) return res.status(413).json({ error: "drawing is too large (max 2 MB PNG)" });
      if (!drawingBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
        return res.status(400).json({ error: "drawing must be a PNG image" });
      }
    }

    // ── validate tags against Guestbook allowed_guestbook_tags ─────────────
    let validIds;
    try {
      validIds = new Set((await getValidTags()).map(t => t.id));
    } catch (err) {
      log.error("submitGuestbook", "tag lookup failed:", err);
      return res.status(502).json({ error: "could not validate tags — please try again" });
    }

    const cleanTagIds = (tags ?? [])
      .map(t => t?.id)
      .filter(id => validIds.has(id));

    // ── handle drawing ────────────────────────────────────────────────────────────
    let drawingMediaId = null;

    if (drawingBuffer) {
      try {
        const file   = await strapiUploadMedia(drawingBuffer, `drawing-${Date.now()}.png`);
        drawingMediaId = file?.id ?? null;
        if (!drawingMediaId) throw new Error("upload returned no media ID");
      } catch (uploadErr) {
        log.warn("submitGuestbook", "drawing upload failed:", uploadErr);
        return res.status(502).json({ error: "drawing upload failed — please try again" });
      }
    }
    // ── post to Strapi ──────────────────────────────────────────────────────
    try {
      const payload = {
        data: {
          name:            name.slice(0, 80),
          website:         website.slice(0, 200) || null,
          message:         message.slice(0, 500) || null,
          date_posted:     new Date().toISOString(),
          ip_address:      ip,
          guestbook_tags: cleanTagIds,
          ...(drawingMediaId && { drawing: drawingMediaId }),
        },
      };

      const saved = await strapiPost("/api/guestbook-entries", payload);
      const documentId = saved.data?.documentId ?? saved.documentId;

      // Connect the new entry to the Guestbook single type relation
      await strapiPut("/api/guestbook", {
        data: { guestbook_entries: { connect: [documentId] } },
      });

      // Re-fetch entry to get populated tags + drawing url
      const full = await strapiGet(`/api/guestbook-entries/${documentId}`, {
        "populate[guestbook_tags]":   "*",
        "populate[drawing]": "*",
      });
      const fullEntry = normalizeEntry(full.data ?? full);

      invalidateCache("/api/guestbook");
      invalidateCache("/api/guestbook-entries");

      log.info("submitGuestbook", "entry created", { documentId, hasDrawing: Boolean(drawingMediaId), tagCount: cleanTagIds.length });
      res.status(201).json({ entry: fullEntry });
    } catch (err) {
      log.error("submitGuestbook", "POST failed:", err);
      res.status(502).json({ error: "failed to save entry" });
    }
  });
}
