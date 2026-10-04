// Adjustment slider ranges (gameplan section 5). One config object so
// they're easy to tune later without hunting through the UI code.
export const SLIDERS = [
  { key: "x", label: "Left / right", min: -60, max: 60, step: 1, default: 0 },
  { key: "y", label: "Up / down", min: -60, max: 60, step: 1, default: 0 },
  { key: "scale", label: "Size", min: 0.8, max: 1.25, step: 0.01, default: 1 },
  { key: "rotation", label: "Rotation", min: -15, max: 15, step: 0.5, default: 0 },
];

export const DEFAULT_PART_STATE = Object.fromEntries(SLIDERS.map((s) => [s.key, s.default]));

export function clampSliderValue(key, value) {
  const config = SLIDERS.find((s) => s.key === key);
  if (!config) return value;
  return Math.min(config.max, Math.max(config.min, value));
}
