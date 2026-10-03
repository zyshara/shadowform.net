// server/jenis32/bootstrap.js
//
// One call to hydrate the jenis32 app: config, enabled activities in
// order, the caller's account (or null if they don't have one yet — they
// always will by the time they reach this, since the client calls
// POST /api/jenis32/account right after login/register, but this stays
// defensive rather than assuming), and the caller's own submissions.

import { requireAuth } from "../middleware/index.js";
import { strapiGet } from "../lib/strapi.js";
import { logger } from "../lib/logger.js";

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

function sanitizeSubmission(sub) {
  return {
    id: sub.documentId,
    activitySlug: sub.activity?.slug ?? null,
    textValue: sub.textValue ?? null,
    jsonValue: sub.jsonValue ?? null,
    media: sub.media ?? [],
    sourceMedia: sub.sourceMedia ?? null,
    caption: sub.caption ?? null,
  };
}

// The jenis32-config singleType 404s via the content API until its one
// row is created — treat that as "no config yet" rather than an error.
async function loadConfig() {
  try {
    const res = await strapiGet("/api/jenis32-config");
    return res.data;
  } catch (err) {
    if (err.message?.includes("404")) return null;
    throw err;
  }
}

export function registerJenis32BootstrapRoutes(app) {
  app.get("/api/jenis32/bootstrap", requireAuth, async (req, res) => {
    try {
      const [config, activitiesRes, accountsRes] = await Promise.all([
        loadConfig(),
        strapiGet("/api/jenis32-activities", {
          "filters[enabled][$eq]": true,
          sort: "order:asc",
          "pagination[pageSize]": 100,
        }),
        strapiGet("/api/jenis32-accounts", {
          "filters[user][id][$eq]": req.user.id,
          "populate[avatar][fields][0]": "url",
          "pagination[pageSize]": 1,
        }, { noCache: true }),
      ]);

      const account = accountsRes.data[0] ?? null;
      let submissions = [];

      if (account) {
        const subsRes = await strapiGet("/api/jenis32-submissions", {
          "filters[account][id][$eq]": account.id,
          "populate[activity][fields][0]": "slug",
          "populate[media][fields][0]": "url",
          "populate[sourceMedia][fields][0]": "url",
          "pagination[pageSize]": 100,
        }, { noCache: true });
        submissions = subsRes.data.map(sanitizeSubmission);
      }

      res.json({
        config: config ? { partyStart: config.partyStart ?? null, discordInvite: config.discordInvite ?? null } : null,
        activities: activitiesRes.data.map((a) => ({
          slug: a.slug,
          title: a.title,
          prompt: a.prompt,
          helpText: a.helpText,
          type: a.type,
          config: a.config ?? {},
          group: a.group,
          order: a.order,
          required: a.required,
        })),
        account: account ? sanitizeAccount(account) : null,
        submissions,
      });
    } catch (err) {
      logger.error("[jenis32] bootstrap failed:", err.message, err.body ?? "");
      res.status(502).json({ error: "could not load data" });
    }
  });
}
