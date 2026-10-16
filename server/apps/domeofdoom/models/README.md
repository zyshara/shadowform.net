# server/apps/domeofdoom/models/

Strapi response normalizers for domeofdoom's own content types — mapping a
raw Strapi entry into the shape the client/cache expects. For the
cross-app normalizers (generic artist/EPK content, rich-text headers), see
`server/models/` instead.

## Contents

- `catalogItem.js` — DomeofDoomCatalogItem → the shape the Catalog/
  CatalogItem pages expect (override ?? derived ?? raw-scrape fallback
  chain).
- `artist.js` — DomeOfDoomArtist → the lean roster-card shape
  (`normalizeArtist`/`normalizeArtists`). Not to be confused with
  `server/models/artist.js`, which normalizes the *generic* `/api/artists`
  content type for EPK/management use.
- `show.js` — Dome of Doom Show → the shape the Shows page expects.
- `aboutPage.js` — Dome of Doom About Page single-type → the shape the
  About page expects.
