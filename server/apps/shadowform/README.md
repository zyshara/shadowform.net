# Shadowform

The personal site runs on React Router SSR + Vite through the shared tenant
adapter. Development HMR uses port 24681. `registerSsr.js` retains the
`/preserved` static mount and supplies shared server services through a
request-scoped RouterContextProvider.

`src/shadowform/app/routes.js` defines the entry screen, layout pages, legacy
redirects, preserved-site viewer, password-reset landing page, and real 404s.
Navigation labels/redirect paths remain in `src/shadowform/data/routes.js`.

- `engineering.js` exposes Strapi-backed server reads for the engineering page,
  archive list, and archive project details.
- `data.js` supplies About/Guestbook reads and re-exports engineering services.
- `routes/guestbook.js` registers only `POST /api/guestbook`. The former GET
  endpoints are replaced by loaders.
- `models/` normalizes data before it is serialized to the browser.

Drawing submissions use a PNG data URL in JSON. `server/middleware/jsonBody.js`
supplies a route-owned 4MB JSON limit for the guestbook POST before reading the
body; decoded PNGs are limited to 2MB. Media uploads must succeed before an entry
is created, and failures return an actionable error. The client retains the
attached drawing on failure and keeps Sign visible after attachment.

Tests use mocked Strapi writes, including a real generated PNG larger than
100KB. Browser verification may draw and attach a local preview without posting.

Run `npm run dev` (Node >=22.22); Vite handles frontend HMR and Nodemon watches
server/config/dependency changes. `npm run build` builds all four SSR tenants
and generates the Dome of Doom sitemap. Webpack and LiveReload are removed.
The legacy auth backend remains unwired, as before this migration.
