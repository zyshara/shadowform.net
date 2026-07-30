// src/domeofdoom/utils/readSeedData.js
//
// Reads a JSON blob seeded into the initial HTML by the server (see
// injectJsonData in server/routes/spas.js) — avoids a network round-trip for
// data the server already had at request time.

export function readSeedData(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return null;

  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}
