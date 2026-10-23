# server/cron/scrapers/

Scraping/API-fetching helpers used by the cron jobs — each one fetches raw
data for one source; normalizing/caching happens elsewhere.

## Contents

- `spotify.js` — per-artist release count + monthly listeners from the
  Spotify Web API (built on `server/lib/spotify.js`'s raw client).
- `instagram.js` — per-artist follower count via the Instagram Graph API,
  keyed by `INSTAGRAM_TOKEN_<SLUG>`. **Unrelated** to
  `server/automation/instagram.js`, which refreshes redspear/low-poly's own
  embed tokens — same env-var naming convention, different concern,
  different apps.
- `bandsintown.js` — per-artist upcoming/past show counts via the
  Bandsintown API, keyed by `BANDSINTOWN_API_KEY_<SLUG>`.
