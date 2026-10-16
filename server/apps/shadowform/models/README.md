# server/apps/shadowform/models/

Strapi response normalizers specific to shadowform's own content types.

## Contents

- `engineering.js` — Engineering Page single-type (including the
  `archive_v2` dynamic zone) → the shapes the Engineering/Archive pages
  expect. Uses the shared `server/models/header.js` for rich-text fields.
- `guestbook.js` — Guestbook single-type + entries → the shape the
  Guestbook/About pages expect, including the word-blacklist redaction.
