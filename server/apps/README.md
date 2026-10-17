# server/apps/

Each subfolder here is one frontend app's own server-side code. Apps register their frontend handler and, when needed, separate API routes:

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
- `redspear/` and `low-poly/` — React Router SSR apps mounted through
  `server/lib/registerSsrApp.js`. Their `/epk` loaders share
  `server/lib/epk.js` and `server/models/epk.js`; neither registers API routes.
