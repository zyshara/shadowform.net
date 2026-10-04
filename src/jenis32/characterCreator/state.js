// State construction, validation, and random/default helpers (gameplan
// sections 6 and 8). The state object IS the saved JSON — kept flat and
// versioned, addressed by id rather than array index so adding or
// reordering assets in the manifest never breaks a saved character.
//
// Generic over part types (eyes, nose, mouth, ...) via derivePartTypes —
// see the mouths addendum, section 3.5: a saved character missing a part
// key (created before that part type existed) loads with that part's
// default id and zeroed sliders, the same fallback as an unknown id.

import { SLIDERS, DEFAULT_PART_STATE, clampSliderValue } from "./sliderConfig.js";
import { derivePartTypes } from "./parts.js";

function firstEnabled(list) {
  return (list.find((item) => item.enabled) ?? list[0])?.id;
}

export function characterKey(bodyType, race) {
  return `${race}_${bodyType}`;
}

export function getCharacter(manifest, bodyType, race) {
  return manifest.characters[characterKey(bodyType, race)] ?? null;
}

export function defaultStateFor(manifest, bodyType, race) {
  const character = getCharacter(manifest, bodyType, race);
  if (!character) return null;
  const d = character.defaults;
  const state = {
    version: 1,
    bodyType,
    race,
    ear: d.ear,
    skinTone: d.skinTone,
    browColor: character.defaultBrowColor,
  };
  for (const partType of derivePartTypes(character)) {
    state[partType] = { id: d[partType], ...DEFAULT_PART_STATE };
  }
  return state;
}

function sanitizePartState(raw, validIds, fallbackId) {
  const id = raw && validIds.includes(raw.id) ? raw.id : fallbackId;
  const out = { id };
  for (const s of SLIDERS) {
    const v = raw?.[s.key];
    out[s.key] = typeof v === "number" && Number.isFinite(v) ? clampSliderValue(s.key, v) : s.default;
  }
  return out;
}

// Loading a saved state must tolerate missing or unknown values — anything
// not found in the manifest (a renamed id, a hand-edited file, an older
// version, a part type that didn't exist yet) falls back to the
// character's defaults rather than breaking.
export function sanitizeState(manifest, raw) {
  const bodyType = manifest.bodyTypes.some((b) => b.id === raw?.bodyType && b.enabled)
    ? raw.bodyType
    : firstEnabled(manifest.bodyTypes);
  const race = manifest.races.some((r) => r.id === raw?.race && r.enabled)
    ? raw.race
    : firstEnabled(manifest.races);

  const character = getCharacter(manifest, bodyType, race);
  if (!character) return null;

  const ear = character.ears.some((e) => e.id === raw?.ear) ? raw.ear : character.defaults.ear;
  const skinTone = character.skinTones.some((t) => t.id === raw?.skinTone) ? raw.skinTone : character.defaults.skinTone;
  const browColor = typeof raw?.browColor === "string" ? raw.browColor : character.defaultBrowColor;

  const state = { version: 1, bodyType, race, ear, skinTone, browColor };
  for (const partType of derivePartTypes(character)) {
    const options = character[partType] ?? [];
    state[partType] = sanitizePartState(raw?.[partType], options.map((o) => o.id), character.defaults[partType]);
  }
  return state;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomSliderValue(key) {
  const config = SLIDERS.find((s) => s.key === key);
  const steps = Math.round((config.max - config.min) / config.step);
  const raw = config.min + Math.round(Math.random() * steps) * config.step;
  return clampSliderValue(key, Math.round(raw * 100) / 100);
}

export function randomStateFor(manifest, bodyType, race) {
  const character = getCharacter(manifest, bodyType, race);
  if (!character) return null;
  const makePart = (list) => {
    const out = { id: randomFrom(list).id };
    for (const s of SLIDERS) out[s.key] = randomSliderValue(s.key);
    return out;
  };
  const state = {
    version: 1,
    bodyType,
    race,
    ear: randomFrom(character.ears).id,
    skinTone: randomFrom(character.skinTones).id,
    browColor: character.defaultBrowColor,
  };
  for (const partType of derivePartTypes(character)) {
    state[partType] = makePart(character[partType] ?? []);
  }
  return state;
}
