# server/auth/

A generic, app-agnostic auth proxy over Strapi's shared `users-permissions`
plugin. Every shadowform.net app shares the same Strapi user pool, so these
routes were designed to not be scoped to any one app's folder — any current
or future app's own register/login UI could call them.

**Currently not wired up** — `server/routes/api.js` does not call
`registerAuthRoutes`. Not deleted, kept as-is, pending a full
re-evaluation of the auth design. `src/shadowform/pages/ResetPassword.jsx`
still calls `/api/auth/reset-password`, which will 404 until this is
re-registered.

## Contents

- `index.js` — `POST /api/auth/register`, `/login`, `/forgot-password`,
  `/reset-password`, and `GET /api/auth/me`. Rate-limited per route. Talks
  to Strapi's own `/api/auth/local` and `/api/users` under the hood, since
  Strapi's built-in public registration endpoint can't be scoped to "came
  through our own UI."
