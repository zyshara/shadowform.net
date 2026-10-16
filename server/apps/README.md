# server/apps/

Each subfolder here is one frontend app's own server-side code. Every app
exports exactly two functions, same names and files throughout:

- `register<App>Api(app)` in `registerApi.js`
- `register<App>Spa(app)` in `registerSpa.js`

Nothing in here is imported by another app — cross-app code (currently
just `server/models/` and `server/lib/epk.js`) lives one level up.

## Contents

- `domeofdoom/` — the record-label site. By far the deepest app: routes,
  cron, scrapers, models, and one-off scripts, on top of its own
  `registerApi`/`registerSpa`. See its own README.
- `shadowform/` — the personal hub site (shadowform.net itself).
  `registerSpa` also owns the archived-sites static mount and the
  catch-all SPA fallback, since nothing else needs to claim "everything
  unmatched." See its own README.
- `redspear/` — `registerApi` owns its own `GET /api/epk` (no slug param —
  the subdomain already says which artist; the fetch itself is shared via
  `server/lib/epk.js`, but the route is redspear's own, scoped to its own
  hostnames); `registerSpa` serves its SPA and special-cases `/epk`'s
  metadata.
- `low-poly/` — same shape as redspear.

## Why redspear/low-poly each register their own EPK route

They share the actual Strapi fetch (`server/lib/epk.js`'s `getEpkBySlug`)
and the response shape (`server/models/epk.js`), since that logic is
genuinely identical — but each app registers and host-scopes its own
`/api/epk` route (passing its own fixed `artistSlug` from
`config/apps.json`) rather than one shared, unscoped, slug-parameterized
route serving both. That keeps every app's API surface uniformly scoped to
its own hostnames, with no cross-app exception — and no redundant slug in
the URL, since the host already picks the artist.
