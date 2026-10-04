// Deriving part types (eyes, nose, mouth, and whatever comes next)
// generically from the manifest instead of hardcoding each one —
// per the mouths addendum, section 3.1: "a part type is any key that
// appears in layerOrder before the dot, and a part may have any subset
// of skin, color, tint, and glow layers" (glow added by the eye-colours
// addendum).

export function derivePartTypes(character) {
  const types = [];
  for (const key of character.layerOrder) {
    const dot = key.indexOf(".");
    if (dot === -1) continue; // "base" has no part type
    const type = key.slice(0, dot);
    if (!types.includes(type)) types.push(type);
  }
  return types;
}

export const SUB_LAYERS = ["skin", "color", "tint", "glow"];
