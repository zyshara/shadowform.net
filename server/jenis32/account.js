// server/jenis32/account.js
//
// jenis32-specific account creation, layered on top of the generic
// server/auth/* routes. Having a jenis32-account row is itself the flag
// that says "this shadowform user is part of the birthday site" (gameplan
// section 3.2) — a shared-pool user who registers or logs in elsewhere
// doesn't get one until they hit this endpoint.

import express from "express";
import { requireAuth } from "../middleware/index.js";
import { strapiGet, strapiPost, strapiPut, strapiUploadMedia } from "../lib/strapi.js";
import { logger } from "../lib/logger.js";

const jsonBody = express.json();
// Avatars arrive as base64 data URLs (same approach the old feat-wedding
// branch's /api/profile/picture used) rather than multipart — this repo
// has no multipart parser set up, and a client-downscaled-to-~800px JPEG
// easily fits a generous JSON body limit without adding one.
const avatarBody = express.json({ limit: "5mb" });

function sanitizeAccount(account) {
  return {
    id: account.documentId,
    firstName: account.firstName ?? null,
    lastName: account.lastName ?? null,
    nickname: account.nickname ?? null,
    avatar: account.avatar ?? null,
    isHost: account.isHost ?? false,
  };
}

async function findAccountByUserId(userId) {
  const data = await strapiGet("/api/jenis32-accounts", {
    "filters[user][id][$eq]": userId,
    "populate[avatar][fields][0]": "url",
    "pagination[pageSize]": 1,
  }, { noCache: true });
  return data?.data?.[0] ?? null;
}

export function registerJenis32AccountRoutes(app) {
  // POST /api/jenis32/account — idempotent create-or-get
  app.post("/api/jenis32/account", jsonBody, requireAuth, async (req, res) => {
    try {
      const existing = await findAccountByUserId(req.user.id);
      if (existing) {
        return res.json({ account: sanitizeAccount(existing) });
      }

      const created = await strapiPost("/api/jenis32-accounts", {
        data: { user: req.user.id },
      });

      res.status(201).json({ account: sanitizeAccount(created.data) });
    } catch (err) {
      logger.error("[jenis32] account create failed:", err.message, err.body ?? "");
      res.status(502).json({ error: "could not create account" });
    }
  });

  // PUT /api/jenis32/account — update own firstName/lastName/nickname/avatar.
  // Ignores isHost and any other field. firstName, lastName, and an avatar
  // are required to end up set (either from this request or already on
  // file) — "Introduce yourself" can't be completed without them, and this
  // is the same endpoint that activity writes to.
  app.put("/api/jenis32/account", avatarBody, requireAuth, async (req, res) => {
    const { firstName, lastName, nickname, avatarDataUrl } = req.body ?? {};

    try {
      const existing = await findAccountByUserId(req.user.id);
      if (!existing) {
        return res.status(404).json({ error: "account not found" });
      }

      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName.trim().slice(0, 100);
      if (lastName !== undefined) updateData.lastName = lastName.trim().slice(0, 100);
      if (nickname !== undefined) updateData.nickname = nickname.trim().slice(0, 100) || null;

      if (avatarDataUrl) {
        if (!avatarDataUrl.startsWith("data:image/")) {
          return res.status(400).json({ error: "avatar must be an image data URL" });
        }
        const [meta, b64] = avatarDataUrl.split(",");
        const mimeType = meta.match(/data:([^;]+)/)[1];
        const ext = mimeType.split("/")[1];
        const buffer = Buffer.from(b64, "base64");
        const file = await strapiUploadMedia(buffer, `avatar-${req.user.id}-${Date.now()}.${ext}`, mimeType);
        updateData.avatar = file.id;
      }

      const resultingFirstName = updateData.firstName ?? existing.firstName;
      const resultingLastName = updateData.lastName ?? existing.lastName;
      const resultingAvatar = updateData.avatar ?? existing.avatar;
      if (!resultingFirstName || !resultingLastName || !resultingAvatar) {
        return res.status(400).json({ error: "first name, last name, and a profile picture are required" });
      }

      await strapiPut(`/api/jenis32-accounts/${existing.documentId}`, { data: updateData });
      // Re-fetch rather than trust the PUT response's shape — it doesn't
      // populate the avatar relation the way findAccountByUserId does.
      const updated = await findAccountByUserId(req.user.id);
      res.json({ account: sanitizeAccount(updated) });
    } catch (err) {
      logger.error("[jenis32] account update failed:", err.message, err.body ?? "");
      res.status(502).json({ error: "could not update account" });
    }
  });
}
