# server/models/

Genuinely cross-app Strapi response normalizers — each file here earned
staying shared by actually being used by more than one app. Everything
app-specific lives in `server/apps/<name>/models/` instead.

## Contents

- `epk.js` — `normalizeEpk`: the EPK page response shape (featured tracks,
  photos/media, press, links). Depends on `artist.js` below.
- `artist.js` — `normalizeArtistForEpk`: normalizes an entry from the
  *generic* `/api/artists` content type into the rich shape EPK needs
  (bio, stats, genres, booking contacts). Not to be confused with
  `server/apps/domeofdoom/models/artist.js`, which normalizes
  DomeOfDoomArtist into a much leaner roster-card shape — different
  content type, different shape, different app.
- `header.js` — rich-text flattening (`richTextToHtml`/
  `richTextToString`) and header-block normalization, shared by
  domeofdoom's about-page model and shadowform's engineering-page model.
