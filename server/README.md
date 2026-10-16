# server/

The Express backend for shadowform.net — one server process serving four
separate frontend apps (domeofdoom, shadowform, redspear, low-poly) by
subdomain/host, plus their Strapi-backed data pipelines.

Two kinds of folders live here:

- **App-owned** (`apps/<name>/`) — routes, cron jobs, caches, and models
  that belong to exactly one app. See `apps/README.md`.
- **Shared infrastructure** — code used by more than one app, or that isn't
  tenant-specific at all.

## Contents

- `apps/` — the four frontend apps' own server-side code. See its README.
- `models/` — genuinely cross-app Strapi response normalizers.
- `automation/` — Notion/Google Calendar/Instagram-token release-management
  tooling. Not tenant code — see its own README for why.
- `auth/` — generic auth proxy over Strapi's shared user pool. Currently
  **not wired up** (see its own README) — kept, not deleted, pending a
  re-evaluation.
- `lib/` — tenant-agnostic infrastructure: Strapi client, logger, rate
  limiter, app-config reader, path/metadata helpers.
- `middleware/` — Express middleware applied to every request regardless
  of app.
- `routes/` — the two top-level orchestrators that wire every app's routes
  into the Express app.
- `cron/index.js` — the top-level cron orchestrator.
- `dev.js` — livereload setup for the dev server.

## Every app owns two functions

Each app in `apps/` exports exactly two registration functions, same
naming pattern throughout:

- `register<App>Api(app)` in `apps/<app>/registerApi.js` — its API routes.
- `register<App>Spa(app)` in `apps/<app>/registerSpa.js` — its SPA-serving
  route.

`routes/api.js` and `routes/spas.js` each just call all four, in that
shape, nothing more. See `config/apps.json` (read via `lib/appsConfig.js`)
for each app's hostnames, canonical domain, and metadata — the thing that
makes `register<App>Api`'s host-scoping and `register<App>Spa`'s
host-sniffing actually work.

## Import aliases

Server code uses Node's native `imports` field (see `package.json`) for
cross-folder imports — `#lib/*`, `#apps/domeofdoom/*`, etc. — instead of
relative paths. Only same-directory sibling imports (`./foo.js`) stay
relative.
