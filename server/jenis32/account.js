// server/jenis32/account.js
//
// jenis32-specific account creation, layered on top of the generic
// server/auth/* routes. Having a jenis32-account row is itself the flag
// that says "this shadowform user is part of the birthday site" (gameplan
// section 3.2) — a shared-pool user who registers or logs in elsewhere
// doesn't get one until they hit this endpoint.

import express from "express";
import { requireAuth } from "../middleware/index.js";
import { strapiGet, strapiPost } from "../lib/strapi.js";
import { logger } from "../lib/logger.js";

const jsonBody = express.json();

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
}
