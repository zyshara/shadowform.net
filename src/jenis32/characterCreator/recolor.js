// Skin recolouring and eyebrow tinting for the character creator.
// Works on ImageData-style RGBA byte arrays (straight alpha, as returned by getImageData).
// No dependencies. Verified against the reference renders in public/character-assets/reference.
//
// Ported as-is from the provided code/recolor.js (jenis32-character-creator
// gameplan section 2, and the mouths addendum's shiftTowardSkin) — only the
// module boundary changed, to this project's ESM convention. The math is
// untouched.

const Xn = 0.95047, Yn = 1.0, Zn = 1.08883; // D65 white point

function srgbToLinear(v) { return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
function linearToSrgb(v) { return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; }
function labF(t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
function labFInv(t) { return t > 0.2068966 ? t * t * t : (t - 16 / 116) / 7.787; }

// r, g, b in 0..255 -> [L, a, b]
function rgbToLab(r, g, b) {
  const R = srgbToLinear(r / 255), G = srgbToLinear(g / 255), B = srgbToLinear(b / 255);
  const x = (0.412453 * R + 0.357580 * G + 0.180423 * B) / Xn;
  const y = (0.212671 * R + 0.715160 * G + 0.072169 * B) / Yn;
  const z = (0.019334 * R + 0.119193 * G + 0.950227 * B) / Zn;
  const fx = labF(x), fy = labF(y), fz = labF(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// [L, a, b] -> [r, g, b] in 0..255 (rounded, clamped)
function labToRgb(L, a, b) {
  const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  const x = labFInv(fx) * Xn, y = labFInv(fy) * Yn, z = Math.max(labFInv(fz), 0) * Zn;
  const R = 3.240479 * x - 1.537150 * y - 0.498535 * z;
  const G = -0.969256 * x + 1.875991 * y + 0.041556 * z;
  const B = 0.055648 * x - 0.204043 * y + 1.057311 * z;
  const out = [R, G, B];
  for (let i = 0; i < 3; i++) {
    const v = linearToSrgb(Math.max(out[i], 0));
    out[i] = Math.round(Math.min(Math.max(v, 0), 1) * 255);
  }
  return out;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Lookup tables keep the per-pixel loop fast enough for a full 1024x1536 image on a phone.
const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) SRGB_TO_LINEAR[i] = srgbToLinear(i / 255);
const LINEAR_TO_SRGB_SIZE = 4096;
const LINEAR_TO_SRGB = new Uint8Array(LINEAR_TO_SRGB_SIZE + 1);
for (let i = 0; i <= LINEAR_TO_SRGB_SIZE; i++) LINEAR_TO_SRGB[i] = Math.round(linearToSrgb(i / LINEAR_TO_SRGB_SIZE) * 255);
function toByte(linear) {
  if (linear <= 0) return 0;
  if (linear >= 1) return 255;
  return LINEAR_TO_SRGB[Math.round(linear * LINEAR_TO_SRGB_SIZE)];
}

/**
 * Recolour skin in place.
 * data:      Uint8ClampedArray of RGBA pixels (ImageData.data)
 * targetHex: the skin tone's "target" from the manifest, e.g. "#9FA4DC". null/undefined = leave as painted.
 * ref:       the character's "skinReference" from the manifest: { L, C }
 *
 * Keeps each pixel's light-and-shadow, replaces its colour with the target's.
 */
export function recolorSkin(data, targetHex, ref) {
  if (!targetHex) return data;
  const [tr, tg, tb] = hexToRgb(targetHex);
  const [tL, ta, tbb] = rgbToLab(tr, tg, tb);
  const lScale = tL / ref.L;
  const cRef = Math.max(ref.C, 10);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    // sRGB -> Lab
    const R = SRGB_TO_LINEAR[data[i]], G = SRGB_TO_LINEAR[data[i + 1]], B = SRGB_TO_LINEAR[data[i + 2]];
    const fx0 = labF((0.412453 * R + 0.357580 * G + 0.180423 * B) / Xn);
    const fy0 = labF(0.212671 * R + 0.715160 * G + 0.072169 * B);
    const fz0 = labF((0.019334 * R + 0.119193 * G + 0.950227 * B) / Zn);
    let L = (116 * fy0 - 16) * lScale;
    if (L < 0) L = 0; else if (L > 100) L = 100;
    const a0 = 500 * (fx0 - fy0), b0 = 200 * (fy0 - fz0);
    let k = Math.sqrt(a0 * a0 + b0 * b0) / cRef;
    if (k < 0.45) k = 0.45; else if (k > 1.5) k = 1.5;
    // Lab -> sRGB with the target's colour
    const fy = (L + 16) / 116, fx = fy + (ta * k) / 500, fz = fy - (tbb * k) / 200;
    const x = labFInv(fx) * Xn, y = labFInv(fy), z = Math.max(labFInv(fz), 0) * Zn;
    data[i] = toByte(3.240479 * x - 1.537150 * y - 0.498535 * z);
    data[i + 1] = toByte(-0.969256 * x + 1.875991 * y + 0.041556 * z);
    data[i + 2] = toByte(0.055648 * x - 0.204043 * y + 1.057311 * z);
  }
  return data;
}

/**
 * Nudge a non-skin layer (lips) part of the way toward the skin tone, in place.
 * data:      Uint8ClampedArray of RGBA pixels
 * targetHex: the skin tone's "target" from the manifest. null/undefined = no change.
 * ref:       the character's "skinReference" from the manifest
 * amount:    0 = untouched, 1 = fully recoloured as skin. Use the layer's value from "skinShift" in the manifest.
 *
 * The layer keeps its own colour and shading; its hue leans toward the skin and its
 * brightness follows the skin by half as much.
 */
export function shiftTowardSkin(data, targetHex, ref, amount) {
  if (!targetHex || !amount) return data;
  const [tr, tg, tb] = hexToRgb(targetHex);
  const [tL, ta, tbb] = rgbToLab(tr, tg, tb);
  const lGain = 1 + (tL / ref.L - 1) * amount * 0.5;
  const cRef = Math.max(ref.C, 10);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const R = SRGB_TO_LINEAR[data[i]], G = SRGB_TO_LINEAR[data[i + 1]], B = SRGB_TO_LINEAR[data[i + 2]];
    const fx0 = labF((0.412453 * R + 0.357580 * G + 0.180423 * B) / Xn);
    const fy0 = labF(0.212671 * R + 0.715160 * G + 0.072169 * B);
    const fz0 = labF((0.019334 * R + 0.119193 * G + 0.950227 * B) / Zn);
    let L = (116 * fy0 - 16) * lGain;
    if (L < 0) L = 0; else if (L > 100) L = 100;
    const a0 = 500 * (fx0 - fy0), b0 = 200 * (fy0 - fz0);
    let k = Math.sqrt(a0 * a0 + b0 * b0) / cRef;
    if (k < 0.45) k = 0.45; else if (k > 1.5) k = 1.5;
    const a1 = a0 + (ta * k - a0) * amount, b1 = b0 + (tbb * k - b0) * amount;
    const fy = (L + 16) / 116, fx = fy + a1 / 500, fz = fy - b1 / 200;
    const x = labFInv(fx) * Xn, y = labFInv(fy), z = Math.max(labFInv(fz), 0) * Zn;
    data[i] = toByte(3.240479 * x - 1.537150 * y - 0.498535 * z);
    data[i + 1] = toByte(-0.969256 * x + 1.875991 * y + 0.041556 * z);
    data[i + 2] = toByte(0.055648 * x - 0.204043 * y + 1.057311 * z);
  }
  return data;
}

/**
 * Colour a greyscale "tint" layer (eyebrows, hair) in place.
 * Mid-grey (127.5) becomes the colour itself; lighter is highlight, darker is shadow.
 */
export function tintLayer(data, colorHex) {
  const [cr, cg, cb] = hexToRgb(colorHex);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const g = data[i] / 127.5;
    data[i] = Math.min(255, Math.round(cr * g));
    data[i + 1] = Math.min(255, Math.round(cg * g));
    data[i + 2] = Math.min(255, Math.round(cb * g));
  }
  return data;
}

/**
 * Colour an eye "glow" layer in place.
 * The layer is greyscale with alpha: white = the hot centre of the eye, darker = its rim and outer glow.
 * coreHex / edgeHex come from the chosen entry in the manifest's "eyeColors".
 * White pixels become the core colour, black pixels the edge colour, with a straight blend between.
 */
export function tintGlow(data, coreHex, edgeHex) {
  const [cr, cg, cb] = hexToRgb(coreHex);
  const [er, eg, eb] = hexToRgb(edgeHex);
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const t = data[i] / 255;
    data[i] = Math.round(er + (cr - er) * t);
    data[i + 1] = Math.round(eg + (cg - eg) * t);
    data[i + 2] = Math.round(eb + (cb - eb) * t);
  }
  return data;
}

export { rgbToLab, labToRgb, hexToRgb };
