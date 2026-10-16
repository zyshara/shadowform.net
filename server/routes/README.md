# server/routes/

The two top-level route orchestrators, both called once from `server.js`
at boot. Neither contains any route logic itself — each just calls every
app's own `register<App>Api`/`register<App>Spa`.

## Contents

- `api.js` — `registerApiRoutes`: mounts each app's `registerApi` behind
  a Router scoped to that app's own hostnames (via
  `#lib/appsConfig.js`'s `requireAppHost`). Auth is intentionally not
  mounted here right now — see `server/auth/README.md`.
- `spas.js` — `registerSpaRoutes`: mounts the one truly shared static
  route (`/shared`), then each app's own `registerSpa` in turn.
