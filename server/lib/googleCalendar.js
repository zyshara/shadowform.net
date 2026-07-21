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
  const res = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });
  return res.data;
}

export async function updateEvent(calendarId, eventId, event) {
  logger.debug("[gcal] updating event:", calendarId, eventId);
  const res = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: event,
  });
  return res.data;
}

export async function deleteEvent(calendarId, eventId) {
  logger.debug("[gcal] deleting event:", calendarId, eventId);
  await calendar.events.delete({
    calendarId,
    eventId,
  });
}
