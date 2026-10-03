// server/jenis32/submissions.js
//
// Upsert the caller's own submission for one activity, by slug. Always
// exactly one submission per (account, activity) — re-answering replaces
// the previous one rather than creating a new row.
//
// M3 only handles the text-based activity types (text, longtext); media,
// drawing, audio, etc. land in later milestones alongside the shared
// upload path those need.

import express from "express";
import { requireAuth } from "../middleware/index.js";
import { strapiGet, strapiPost, strapiPut } from "../lib/strapi.js";
import { logger } from "../lib/logger.js";

const jsonBody = express.json();

const TEXT_TYPES = ["text", "longtext"];

// Mirrors the client-side live-validation in the longtext activity
// renderer — words split on whitespace, length counts letters/digits
// only (punctuation and apostrophes are free), hyphens don't split a word.
function validateLongtext(value, config = {}) {
  const { maxWords, maxWordLength, wordTooLongMessage = "WORD TOO BIG", tooManyWordsMessage = "TOO MANY WORD" } = config;
  const words = value.trim().split(/\s+/).filter(Boolean);

  if (maxWords && words.length > maxWords) {
    return tooManyWordsMessage;
  }

  if (maxWordLength) {
    for (const word of words) {
      const letterDigitCount = (word.match(/[a-zA-Z0-9]/g) || []).length;
      if (letterDigitCount > maxWordLength) {
        return wordTooLongMessage;
      }
    }
  }

  return null;
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
    "pagination[pageSize]": 1,
  }, { noCache: true });
  return data?.data?.[0] ?? null;
}

export function registerJenis32SubmissionRoutes(app) {
  app.put("/api/jenis32/submissions/:activitySlug", jsonBody, requireAuth, async (req, res) => {
    const { activitySlug } = req.params;
    const { textValue } = req.body ?? {};

    if (typeof textValue !== "string" || !textValue.trim()) {
      return res.status(400).json({ error: "textValue is required" });
    }

    try {
      const activity = await findActivityBySlug(activitySlug);
      if (!activity) {
        return res.status(404).json({ error: "activity not found" });
      }
      if (!TEXT_TYPES.includes(activity.type)) {
        return res.status(400).json({ error: `activity type "${activity.type}" isn't supported by this endpoint yet` });
      }

      if (activity.type === "longtext") {
        const validationError = validateLongtext(textValue, activity.config ?? {});
        if (validationError) {
          return res.status(400).json({ error: validationError });
        }
      }

      const account = await findAccountByUserId(req.user.id);
      if (!account) {
        return res.status(404).json({ error: "account not found" });
      }

      const existing = await findSubmission(account.id, activity.id);
      if (existing) {
        await strapiPut(`/api/jenis32-submissions/${existing.documentId}`, { data: { textValue } });
      } else {
        await strapiPost("/api/jenis32-submissions", {
          data: { account: account.id, activity: activity.id, textValue },
        });
      }

      res.json({ ok: true });
    } catch (err) {
      logger.error("[jenis32] submission upsert failed:", err.message, err.body ?? "");
      res.status(502).json({ error: "could not save your answer" });
    }
  });
}
