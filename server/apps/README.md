# server/apps/

Each subfolder here is one frontend app's own server-side code. Apps register their frontend handler and, when needed, separate API routes:

- `register<App>Api(app)` in `registerApi.js`
- `register<App>Ssr(app)` in `registerSsr.js`

Nothing in here is imported by another app — cross-app code (currently
`server/models/`, `server/lib/`, and generic stats in `server/cron/`) lives one level up.

## Contents

- `domeofdoom/` — the record-label site. By far the deepest app: routes,
  Strapi-backed SSR loaders, ingestion cron jobs, models, and manual scripts.
  Its only custom API is the contact POST. See its own README.
- `shadowform/` — the personal hub site (shadowform.net itself).
  `registerSsr` mounts its SSR frontend and preserved archived sites.
  Server loaders replace read APIs; the guestbook POST remains. See its README.
- `redspear/` and `low-poly/` — React Router SSR apps mounted through
  `server/lib/registerSsrApp.js`. Their `/epk` loaders share
  `server/lib/epk.js` and `server/models/epk.js`; neither registers API routes.

Apps with data services expose `data.js`; apps with public write endpoints keep
handlers in `routes/` and mount them through `registerApi.js`. Each write route
owns its JSON body limit and uses shared rate-limiting middleware. SSR context
construction and host-scoped static serving live in the shared adapter. HMR
ports are configured in `config/apps.json`.
