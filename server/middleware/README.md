# server/middleware/

Express middleware applied globally in `server.js`, regardless of which
app a request is headed for.

## Contents

- `index.js` — `sslRedirect` (forces https + the canonical host),
  `noCacheHtml` (no-store on HTML responses, static assets pass through),
  `stripTrailingSlash`, and `requireAuth` (verifies a caller's JWT by
  forwarding it to Strapi's own `/api/users/me` rather than checking it
  locally — see `server/auth/README.md` for the auth routes this guards).
