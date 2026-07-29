// server/lib/googleCalendar.js
//
// Personal Google Calendar access requires OAuth2 (a service account can't
// see a personal calendar without Workspace domain-wide delegation). The
// refresh token below is obtained once via server/scripts/getGoogleToken.js.
//
// Each artist has their own calendar, so calendarId is passed per call
// rather than fixed — see GOOGLE_CALENDAR_ID_* env vars.

import { google } from "googleapis";
import { logger } from "./logger.js";

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI  = process.env.GOOGLE_REDIRECT_URI;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// "Rate Limit Exceeded" alone doesn't say whether this is a few-second burst
// limit or a much longer per-day quota, or give a retry-after hint — all of
// which the API actually returns, just not in err.message.
function describeGoogleError(err) {
  const status     = err.response?.status ?? err.code;
  const reason      = err.response?.data?.error?.errors?.[0]?.reason ?? err.errors?.[0]?.reason;
  const retryAfter  = err.response?.headers?.["retry-after"];
  return [
    status ? `status=${status}` : null,
    reason ? `reason=${reason}` : null,
    retryAfter ? `retry-after=${retryAfter}s` : null,
  ].filter(Boolean).join(" ") || "no additional detail";
}

// Google's own docs call this class of error retryable: a short-burst quota
// brush that's usually gone within a couple seconds, not a real failure.
// Confirmed in practice — 2 of 9 calls in one batch hit this while the
// other 7 (before and after) succeeded seconds apart.
const RETRYABLE_REASONS = new Set(["rateLimitExceeded", "userRateLimitExceeded", "quotaExceeded"]);

function isRetryable(err) {
  const reason = err.response?.data?.error?.errors?.[0]?.reason ?? err.errors?.[0]?.reason;
  return RETRYABLE_REASONS.has(reason);
}

async function withRetry(fn, { attempts = 4, baseDelayMs = 1000 } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= attempts || !isRetryable(err)) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1);
      logger.warn(`[gcal] ${describeGoogleError(err)} — retrying in ${delay}ms (attempt ${attempt}/${attempts})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function listEvents(calendarId, params = {}) {
  logger.debug("[gcal] listing events:", calendarId);
  const res = await calendar.events.list({
    calendarId,
    singleEvents: true,
    ...params,
  });
  return res.data.items ?? [];
}

export async function createEvent(calendarId, event) {
  logger.debug("[gcal] creating event:", calendarId, event.summary);
  try {
    const res = await withRetry(() => calendar.events.insert({
      calendarId,
      requestBody: event,
    }));
    return res.data;
  } catch (err) {
    logger.error("[gcal] create failed:", describeGoogleError(err));
    throw err;
  }
}

export async function updateEvent(calendarId, eventId, event) {
  logger.debug("[gcal] updating event:", calendarId, eventId);
  try {
    const res = await withRetry(() => calendar.events.patch({
      calendarId,
      eventId,
      requestBody: event,
    }));
    return res.data;
  } catch (err) {
    logger.error("[gcal] update failed:", describeGoogleError(err));
    throw err;
  }
}

export async function deleteEvent(calendarId, eventId) {
  logger.debug("[gcal] deleting event:", calendarId, eventId);
  await calendar.events.delete({
    calendarId,
    eventId,
  });
}
