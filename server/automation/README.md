# server/automation/

Release-management automation — **not tenant/app code.** This syncs a
Notion workspace (release/rollout/task tracking) to Google Calendar, and
keeps redspear/low-poly's own Instagram embed tokens fresh. It happens to
reference "Red Spear" and "Low Poly" as managed artists, which is why an
earlier pass briefly mis-filed it as "redspear/low-poly's backend" — it
isn't; there's no frontend consumer of any of this, it's personal
release-planning tooling that runs in the background.

## Contents

- `notion.js` — the cron orchestration: marks overdue rollout tasks,
  creates rollouts from new releases, and syncs rollouts/tasks to Google
  Calendar. Runs every minute.
- `notionApi.js` — raw Notion API client (`queryDatabase`, `createPage`,
  `updatePage`, `getPage`), handles the 2025-09+ data-source split.
- `googleCalendar.js` — raw Google Calendar client (`createEvent`,
  `updateEvent`) via a personal OAuth2 refresh token.
- `getGoogleToken.js` — one-time manual helper to obtain that refresh
  token. Run directly, follow the printed URL.
- `instagram.js` — the cron job: refreshes redspear/low-poly's long-lived
  Instagram tokens daily (they expire after 60 days).
- `instagramApi.js` — raw Instagram Graph API client for the token
  refresh above.
- `env.js` — persists a refreshed token back into `.env` (and the current
  process) so it survives restarts without manual re-pasting.
