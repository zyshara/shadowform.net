// server/lib/bandcampCache.js
//
// In-memory singleton for Bandcamp-scraped data — module state is a natural
// singleton in Node/ESM (see spotify.js's token cache for the same shape).
// The cron jobs write to these; server/routes/spas.js reads them to seed the
// domeofdoom client bundle on each request.

let discography = [];
let roster = [];
let merch = [];
let shows = [];
let aboutPage = null;

export function getDiscography() {
  return discography;
}

export function setDiscography(releases) {
  discography = releases;
}

export function getRoster() {
  return roster;
}

export function setRoster(artists) {
  roster = artists;
}

export function getMerch() {
  return merch;
}

export function setMerch(items) {
  merch = items;
}

export function getShows() {
  return shows;
}

export function setShows(events) {
  shows = events;
}

export function getAboutPage() {
  return aboutPage;
}

export function setAboutPage(page) {
  aboutPage = page;
}
