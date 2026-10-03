// server/jenis32/drawing.js
//
// Upload path for the "drawing" activity type. The client flattens its
// canvas to a PNG (canvas.toBlob) and also sends the raw stroke data as
// JSON (gameplan section 6: "store stroke data in jsonValue so the
// gallery can replay the drawing"). Keeping strokes alongside the PNG
// also lets the activity screen rebuild an editable canvas on reopen
// instead of just showing a flat image.

import multer from "multer";
import { requireAuth } from "../middleware/index.js";
import { strapiGet, strapiPost, strapiPut, strapiUploadMedia } from "../lib/strapi.js";
import { logger } from "../lib/logger.js";

const MAX_PNG_BYTES = 8 * 1024 * 1024; // 8MB — a flattened canvas PNG is small

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PNG_BYTES },
});

async function findActivityBySlug(slug) {
  const data = await strapiGet("/api/jenis32-activities", {
    "filters[slug][$eq]": slug,
    "pagination[pageSize]": 1,
  });
  return data?.data?.[0] ?? null;
}

async function findAccountByUserId(userId) {
  const data = await strapiGet("/api/jenis32-accounts", {
    "filters[user][id][$eq]": userId,
    "pagination[pageSize]": 1,
  }, { noCache: true });
  return data?.data?.[0] ?? null;
}

async function findSubmission(accountId, activityId) {
  const data = await strapiGet("/api/jenis32-submissions", {
    "filters[account][id][$eq]": accountId,
    "filters[activity][id][$eq]": activityId,
    "populate[media][fields][0]": "url",
    "populate[media][fields][1]": "mime",
    "pagination[pageSize]": 1,
  }, { noCache: true });
  return data?.data?.[0] ?? null;
}

function sanitizeSubmission(sub) {
  return {
    id: sub.documentId,
    media: (sub.media ?? []).map((m) => ({ id: m.id, url: m.url, mime: m.mime })),
    jsonValue: sub.jsonValue ?? null,
  };
}

export function registerJenis32DrawingRoutes(app) {
  app.put(
    "/api/jenis32/submissions/:activitySlug/drawing",
    requireAuth,
    (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Drawing too large" : err.message });
        }
        if (err) return res.status(400).json({ error: "upload failed" });
        next();
      });
    },
    async (req, res) => {
      const { activitySlug } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "a drawing file is required" });
      }
      if (file.mimetype !== "image/png") {
        return res.status(400).json({ error: "drawing must be a PNG" });
      }

      let strokes = null;
      if (typeof req.body?.strokes === "string" && req.body.strokes) {
        try {
          strokes = JSON.parse(req.body.strokes);
        } catch {
          return res.status(400).json({ error: "malformed stroke data" });
        }
      }

      try {
        const activity = await findActivityBySlug(activitySlug);
        if (!activity) return res.status(404).json({ error: "activity not found" });
        if (activity.type !== "drawing") {
          return res.status(400).json({ error: `activity type "${activity.type}" isn't supported by this endpoint` });
        }

        const account = await findAccountByUserId(req.user.id);
        if (!account) return res.status(404).json({ error: "account not found" });

        const uploaded = await strapiUploadMedia(file.buffer, `drawing-${account.id}-${Date.now()}.png`, "image/png");
        const updateData = { media: [uploaded.id], jsonValue: { strokes } };

        const existing = await findSubmission(account.id, activity.id);
        if (existing) {
          await strapiPut(`/api/jenis32-submissions/${existing.documentId}`, { data: updateData });
        } else {
          await strapiPost("/api/jenis32-submissions", {
            data: { account: account.id, activity: activity.id, ...updateData },
          });
        }

        const updated = await findSubmission(account.id, activity.id);
        res.json({ submission: sanitizeSubmission(updated) });
      } catch (err) {
        logger.error("[jenis32] drawing upload failed:", err.message, err.body ?? "");
        res.status(502).json({ error: "could not save your drawing" });
      }
    }
  );
}
