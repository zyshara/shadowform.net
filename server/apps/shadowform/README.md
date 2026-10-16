# server/apps/shadowform/

The personal hub site at shadowform.net itself (the bare apex domain —
no subdomain).

## Contents

- `registerApi.js` — `registerShadowformApi`: registers guestbook +
  engineering routes, scoped to shadowform's own hostnames by
  `server/routes/api.js`.
- `registerSpa.js` — `registerShadowformSpa`: serves the built SPA. Also
  owns the `/preserved` archived-sites static mount and the final
  catch-all fallback (unconditional — no host check), since nothing else
  needs to claim "everything unmatched."
- `engineering.js` — engineering page, archive list, and archive-project-
  by-slug routes (`/api/engineering*`).
- `guestbook.js` — guestbook read/post + tags routes (`/api/guestbook*`),
  with its own rate limiter and a short-TTL tag cache.
- `models/` — Strapi response normalizers for these two routes. See its
  README.
