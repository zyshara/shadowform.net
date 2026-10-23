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
  limiter, app-config reader, and shared SSR adapter.
- `middleware/` — Express middleware applied to every request regardless
  of app.
- `routes/` — the two top-level orchestrators that wire every app's routes
  into the Express app.
- `cron/index.js` — the top-level cron orchestrator.
- Frontends use tenant-specific Vite middleware in development and built
  React Router SSR bundles in production; see `lib/registerSsrApp.js`.

`npm run build` clears the four active tenants' generated output before
rebuilding their client/server bundles and the Dome of Doom sitemap.
`npm run clean` performs that cleanup alone; archived apps in `dist` are preserved.
Each tenant's Vite config owns its PostCSS plugins, and Tailwind v4 theme
tokens live in CSS.

## App registration

Each app exposes `register<App>Ssr(app)` in `apps/<app>/registerSsr.js`.
The shared adapter registers Vite/React Router SSR and supplies
server data services to route loaders. `routes/ssr.js` registers all four.

`routes/api.js` mounts only the remaining write APIs: Shadowform's guestbook
POST and Dome of Doom's contact POST, scoped to their tenant hostnames.
Page reads use SSR loaders instead of separate JSON endpoints.
See `config/apps.json` (read via `lib/appsConfig.js`) for each app's
hostnames, canonical domain, and metadata.

## Import aliases

Server code uses Node's native `imports` field (see `package.json`) for
cross-folder imports — `#lib/*`, `#apps/domeofdoom/*`, etc. — instead of
relative paths. Only same-directory sibling imports (`./foo.js`) stay
relative.

## Startup and background work

`app.js` exports `createApp()` without opening sockets or scheduling jobs.
The root `server.js` starts the listener, then loads cron modules only when
jobs are enabled. `CRON_ENABLED` defaults to `true` in production and `false`
in development; set it explicitly to override. Run scheduled jobs in only
one web process if deploying multiple instances (`CRON_ENABLED=false` on the
others). Process-local deduplication/overlap protection is not a distributed lock.

Production Heroku dynos (`NODE_ENV=production` and `DYNO` set) default to
trusting one router hop. Local development and other hosts default to untrusted
forwarding headers. `TRUST_PROXY` explicitly overrides this default (a trusted
subnet list, hop count, or `false`). This assumes Heroku only, without a CDN.
Both public POST routes use Express `req.ip`
and return `Retry-After` on throttled requests. Counters and read caches are
in-memory per process; they are not shared between instances.

## Data and cache conventions

Tenant `data.js` modules supply normalized read services to SSR loaders;
`routes/` contains write handlers and owns JSON body limits. Each app keeps
its own models because its Strapi schemas differ. Shared transport, media URL
resolution, rate limiting, and cache behavior live in `lib/`.

`lib/cache.js` supplies bounded caches with concurrent-load deduplication,
expiry cleanup, and invalidation that cannot resurrect an old in-flight result.
The default TTL is `STRAPI_CACHE_TTL_MS` (five minutes). `noCache` bypasses
both reads and writes. Guestbook submissions invalidate only guestbook queries.
HTML remains `no-store`; generated `/assets/` files cache immutably for one
year, while other built static files such as the sitemap cache for five minutes.
