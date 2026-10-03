// server/jenis32/media.js
//
// Upload path for the "media" activity type (photos/video — Goldshire's
// up-to-10 gallery, pet tax, the birthday shot, etc.). Separate from
// submissions.js's text-based upsert because this one needs real
// multipart handling (multer) rather than a JSON body: a photo or video
// is too big for the base64-in-JSON approach the profile-picture upload
// uses, and gameplan 3.4 wants a real XHR progress bar, which needs an
// actual multipart POST for the browser to report upload progress on.
//
// Proxied through Strapi/Express rather than direct-to-Cloudinary for
// now, per the M4 plan — settle whether Heroku's ~30s router timeout is
// actually a problem before building the direct-upload fallback.

import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/index.js";
import { strapiGet, strapiPost, strapiPut, strapiUploadMedia } from "../lib/strapi.js";
import { logger } from "../lib/logger.js";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

// Multer's own ceiling is the larger of the two — per-file type limits are
// enforced in the handler below, where we know which types this specific
// activity accepts.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_BYTES, files: 10 },
});

function kindOf(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return null;
}

// "gif" in an activity's accept config is a stricter sibling of "image" —
// matched by exact mimetype rather than by broad kind, so an activity can
// require an actual GIF (reminds-you-of-jen) without affecting the plain
// "image" activities that are happy to take a GIF among other image types.
function acceptsFile(accept, kind, mimetype) {
  return accept.some((a) => (a === "gif" ? mimetype === "image/gif" : a === kind));
}

function maxBytesFor(kind) {
  return kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

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
    caption: sub.caption ?? null,
  };
}

export function registerJenis32MediaRoutes(app) {
  app.put(
    "/api/jenis32/submissions/:activitySlug/media",
    requireAuth,
    (req, res, next) => {
      upload.array("files", 10)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "File too large" : err.message });
        }
        if (err) return res.status(400).json({ error: "upload failed" });
        next();
      });
    },
    async (req, res) => {
      const { activitySlug } = req.params;
      const caption = typeof req.body?.caption === "string" ? req.body.caption.trim().slice(0, 280) : undefined;
      const files = req.files ?? [];

      if (files.length === 0) {
        return res.status(400).json({ error: "at least one file is required" });
      }

      try {
        const activity = await findActivityBySlug(activitySlug);
        if (!activity) return res.status(404).json({ error: "activity not found" });
        if (activity.type !== "media") {
          return res.status(400).json({ error: `activity type "${activity.type}" isn't supported by this endpoint` });
        }

        const config = activity.config ?? {};
        const accept = config.accept ?? ["image"];
        const allowMultiple = Boolean(config.allowMultiple);
        const maxFiles = config.maxFiles ?? 1;

        if (!allowMultiple && files.length > 1) {
          return res.status(400).json({ error: "this activity only accepts one file" });
        }

        for (const file of files) {
          const kind = kindOf(file.mimetype);
          if (!kind || !acceptsFile(accept, kind, file.mimetype)) {
            return res.status(400).json({ error: `${file.originalname}: unsupported file type` });
          }
          if (file.size > maxBytesFor(kind)) {
            return res.status(400).json({ error: `${file.originalname}: too large (max ${Math.round(maxBytesFor(kind) / 1024 / 1024)}MB)` });
          }
        }

        const account = await findAccountByUserId(req.user.id);
        if (!account) return res.status(404).json({ error: "account not found" });

        const existing = await findSubmission(account.id, activity.id);

        if (allowMultiple) {
          const existingCount = existing?.media?.length ?? 0;
          if (existingCount + files.length > maxFiles) {
            return res.status(400).json({ error: `up to ${maxFiles} files total — you already have ${existingCount}` });
          }
        }

        const uploaded = [];
        for (const file of files) {
          const result = await strapiUploadMedia(file.buffer, file.originalname, file.mimetype);
          uploaded.push(result.id);
        }

        const mediaIds = allowMultiple
          ? [...(existing?.media?.map((m) => m.id) ?? []), ...uploaded]
          : uploaded;

        const updateData = { media: mediaIds };
        if (caption !== undefined) updateData.caption = caption;

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
        logger.error("[jenis32] media upload failed:", err.message, err.body ?? "");
        res.status(502).json({ error: "could not upload your file(s)" });
      }
    }
  );

  // DELETE /api/jenis32/submissions/:activitySlug/media/:fileId — remove
  // one file from a multi-upload submission (Goldshire's up-to-10).
  app.delete("/api/jenis32/submissions/:activitySlug/media/:fileId", requireAuth, async (req, res) => {
    const { activitySlug, fileId } = req.params;

    try {
      const activity = await findActivityBySlug(activitySlug);
      if (!activity) return res.status(404).json({ error: "activity not found" });

      const account = await findAccountByUserId(req.user.id);
      if (!account) return res.status(404).json({ error: "account not found" });

      const existing = await findSubmission(account.id, activity.id);
      if (!existing) return res.status(404).json({ error: "submission not found" });

      const remainingIds = (existing.media ?? [])
        .filter((m) => String(m.id) !== String(fileId))
        .map((m) => m.id);

      await strapiPut(`/api/jenis32-submissions/${existing.documentId}`, { data: { media: remainingIds } });

      const updated = await findSubmission(account.id, activity.id);
      res.json({ submission: sanitizeSubmission(updated) });
    } catch (err) {
      logger.error("[jenis32] media remove failed:", err.message, err.body ?? "");
      res.status(502).json({ error: "could not remove that file" });
    }
  });
}
