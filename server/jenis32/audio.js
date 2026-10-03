// server/jenis32/audio.js
//
// Upload path for the "audio" activity type (Jen's birthday voice
// message). MediaRecorder's output container varies by browser — Chrome
// produces webm/opus, Safari produces mp4/aac — so this accepts whatever
// audio/* mimetype the browser actually recorded rather than hardcoding
// one (gameplan section 6). Duration is capped client-side by a hard
// stop at config.maxSeconds; this only re-enforces file size, the same
// trade-off media.js makes for video length.

import multer from "multer";
import { requireAuth } from "../middleware/index.js";
import { strapiGet, strapiPost, strapiPut, strapiUploadMedia } from "../lib/strapi.js";
import { logger } from "../lib/logger.js";

const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20MB — generous for ~2 minutes of compressed audio

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AUDIO_BYTES },
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
    "populate[media][fields][2]": "name",
    "pagination[pageSize]": 1,
  }, { noCache: true });
  return data?.data?.[0] ?? null;
}

function sanitizeSubmission(sub) {
  return {
    id: sub.documentId,
    media: (sub.media ?? []).map((m) => ({ id: m.id, url: m.url, mime: m.mime, name: m.name })),
  };
}

export function registerJenis32AudioRoutes(app) {
  app.put(
    "/api/jenis32/submissions/:activitySlug/audio",
    requireAuth,
    (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Recording too large" : err.message });
        }
        if (err) return res.status(400).json({ error: "upload failed" });
        next();
      });
    },
    async (req, res) => {
      const { activitySlug } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "a recording is required" });
      }
      if (!file.mimetype.startsWith("audio/")) {
        return res.status(400).json({ error: "file must be an audio recording" });
      }

      try {
        const activity = await findActivityBySlug(activitySlug);
        if (!activity) return res.status(404).json({ error: "activity not found" });
        if (activity.type !== "audio") {
          return res.status(400).json({ error: `activity type "${activity.type}" isn't supported by this endpoint` });
        }

        const account = await findAccountByUserId(req.user.id);
        if (!account) return res.status(404).json({ error: "account not found" });

        const uploaded = await strapiUploadMedia(file.buffer, file.originalname, file.mimetype);
        const updateData = { media: [uploaded.id] };

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
        logger.error("[jenis32] audio upload failed:", err.message, err.body ?? "");
        res.status(502).json({ error: "could not save your recording" });
      }
    }
  );
}
