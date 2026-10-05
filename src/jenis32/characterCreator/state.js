// State construction, validation, and random/default helpers (gameplan
// sections 6 and 8). The state object IS the saved JSON — kept flat and
// versioned, addressed by id rather than array index so adding or
// reordering assets in the manifest never breaks a saved character.
//
// Generic over part types (eyes, nose, mouth, hair, ...) via
// derivePartTypes. Two shapes of part exist:
//   - "slotted" parts (any option has a pivot): id + the four sliders,
//     e.g. eyes, nose, mouth.
//   - "simple" parts (no option has a pivot): just an id, no sliders,
//     e.g. hair — and, per the hair addendum, nullable ("none"/bald) when
//     the part type is listed in the manifest's optionalParts.
// A saved character missing a part key entirely (created before that part
// type existed) loads with that part's default id and zeroed sliders (or
// its default id for a simple part) — the same fallback as an unknown id.
// Extra keys from an older save shape (ear, browColor) are simply never
// read, so they're harmlessly ignored rather than needing to be stripped.

import { SLIDERS, DEFAULT_PART_STATE, RANDOMIZE_RANGES, clampSliderValue } from "./sliderConfig.js";
import { derivePartTypes } from "./parts.js";

const STATE_VERSION = 4;

function firstEnabled(list) {
  return (list.find((item) => item.enabled) ?? list[0])?.id;
}

export function characterKey(bodyType, race) {
  return `${race}_${bodyType}`;
}

export function getCharacter(manifest, bodyType, race) {
  return manifest.characters[characterKey(bodyType, race)] ?? null;
}

function hasPivot(character, partType) {
  return (character[partType] ?? []).some((o) => o.pivot);
}

export function slottedPartTypes(character) {
  return derivePartTypes(character).filter((p) => hasPivot(character, p));
}

export function simplePartTypes(character) {
  return derivePartTypes(character).filter((p) => !hasPivot(character, p));
}

export function isOptional(character, partType) {
  return (character.optionalParts ?? []).includes(partType);
}

export function defaultStateFor(manifest, bodyType, race) {
  const character = getCharacter(manifest, bodyType, race);
  if (!character) return null;
  const d = character.defaults;
  const state = {
    version: STATE_VERSION,
    bodyType,
    race,
    background: manifest.defaultBackground ?? null,
    frame: manifest.defaultFrame ?? null,
    skinTone: d.skinTone,
    eyeColor: d.eyeColor,
    hairColor: d.hairColor,
  };
  for (const partType of slottedPartTypes(character)) {
    state[partType] = { id: d[partType], ...DEFAULT_PART_STATE };
  }
  for (const partType of simplePartTypes(character)) {
    state[partType] = d[partType] ? { id: d[partType] } : null;
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

  const skinTone = character.skinTones.some((t) => t.id === raw?.skinTone) ? raw.skinTone : character.defaults.skinTone;
  const eyeColor = (character.eyeColors ?? []).some((c) => c.id === raw?.eyeColor) ? raw.eyeColor : character.defaults.eyeColor;
  const hairColor = (character.hairColors ?? []).some((c) => c.id === raw?.hairColor) ? raw.hairColor : character.defaults.hairColor;
  // Unlike every other field, a missing or unknown background/frame falls
  // back to none rather than the manifest default — an older save (no
  // background/frame key at all) should look the same as when it was
  // saved, not suddenly grow a background it never had.
  const background = (manifest.backgrounds ?? []).some((b) => b.id === raw?.background) ? raw.background : null;
  const frame = (manifest.frames ?? []).some((f) => f.id === raw?.frame) ? raw.frame : null;

  const state = { version: STATE_VERSION, bodyType, race, background, frame, skinTone, eyeColor, hairColor };

  for (const partType of slottedPartTypes(character)) {
    const options = character[partType] ?? [];
    state[partType] = sanitizePartState(raw?.[partType], options.map((o) => o.id), character.defaults[partType]);
  }

  for (const partType of simplePartTypes(character)) {
    const options = character[partType] ?? [];
    // An optional part can be deliberately null ("none") — that's only a
    // valid choice when explicitly saved as null; a missing key (older
    // save, part type didn't exist yet) falls back to the default instead.
    if (isOptional(character, partType) && raw?.[partType] === null) {
      state[partType] = null;
      continue;
    }
    const rawId = raw?.[partType]?.id;
    const id = options.some((o) => o.id === rawId) ? rawId : character.defaults[partType];
    state[partType] = id ? { id } : null;
  }

  return state;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomSliderValue(key) {
  const config = SLIDERS.find((s) => s.key === key);
  const range = RANDOMIZE_RANGES[key];
  if (!range) return config.default; // not randomized (e.g. rotation) — stays at default
  const steps = Math.round((range.max - range.min) / config.step);
  const raw = range.min + Math.round(Math.random() * steps) * config.step;
  return clampSliderValue(key, Math.round(raw * 100) / 100);
}

// currentFrame is passed through unchanged — "Randomise leaves the frame
// as it is" (the frames addendum). Everything else, including the
// background, is freshly randomized.
export function randomStateFor(manifest, bodyType, race, currentFrame = null) {
  const character = getCharacter(manifest, bodyType, race);
  if (!character) return null;
  const makeSlotted = (list) => {
    const out = { id: randomFrom(list).id };
    for (const s of SLIDERS) out[s.key] = randomSliderValue(s.key);
    return out;
  };
  const backgroundChoices = [...(manifest.backgrounds ?? []), { id: null }];
  const state = {
    version: STATE_VERSION,
    bodyType,
    race,
    background: randomFrom(backgroundChoices).id,
    frame: currentFrame,
    skinTone: randomFrom(character.skinTones).id,
    eyeColor: randomFrom(character.eyeColors ?? [{ id: character.defaults.eyeColor }]).id,
    hairColor: randomFrom(character.hairColors ?? [{ id: character.defaults.hairColor }]).id,
  };
  for (const partType of slottedPartTypes(character)) {
    state[partType] = makeSlotted(character[partType] ?? []);
  }
  for (const partType of simplePartTypes(character)) {
    const options = character[partType] ?? [];
    const choices = isOptional(character, partType) ? [...options, null] : options;
    const picked = randomFrom(choices);
    state[partType] = picked ? { id: picked.id } : null;
  }
  return state;
}
