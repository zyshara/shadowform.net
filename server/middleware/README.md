# server/middleware/

Express middleware applied globally in `server.js`, regardless of which
app a request is headed for.

## Contents

- `index.js` — `sslRedirect` (forces https + the canonical host),
  `noCacheHtml` (no-store on HTML responses, static assets pass through),
  `stripTrailingSlash`, and `requireAuth` (verifies a caller's JWT by
  forwarding it to Strapi's own `/api/users/me` rather than checking it
  locally — see `server/auth/README.md` for the auth routes this guards).

`jsonBody.js` exports a route-owned JSON parser with consistent JSON errors.
Contact uses the normal 100KB limit, guestbook uses 4MB for base64 PNGs;
static/SSR requests do not run a JSON parser.

`requestLogging.js` records request completion/aborted connections with tenant,
HTTP method, pathname, status and duration. It does not log request bodies or
incoming query strings (which can contain password-reset codes).
