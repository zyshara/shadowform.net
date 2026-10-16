# server/apps/domeofdoom/scrapers/

Scraping/API-fetching helpers used by the cron jobs — each one fetches raw
data for one source; normalizing/caching happens elsewhere.

## Contents

- `bandcampRoster.js` — scrapes the Bandcamp artist roster page.
- `bandcampMerch.js` — scrapes the Bandcamp merch grid.
- `spotify.js` — per-artist release count + monthly listeners from the
  Spotify Web API (built on `../spotifyApi.js`'s raw client).
- `instagram.js` — per-artist follower count via the Instagram Graph API,
  keyed by `INSTAGRAM_TOKEN_<SLUG>`. **Unrelated** to
  `server/automation/instagram.js`, which refreshes redspear/low-poly's own
  embed tokens — same env-var naming convention, different concern,
  different apps.
- `bandsintown.js` — per-artist upcoming/past show counts via the
  Bandsintown API, keyed by `BANDSINTOWN_API_KEY_<SLUG>`.
- `htmlEntities.js` — shared HTML-entity decoder used by the scrapers above
  (Bandcamp's HTML isn't pre-decoded).
