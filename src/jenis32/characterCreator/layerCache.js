// Asset loading + per-(file, variant) preparation cache for the character
// creator (gameplan section 4.5). Keeps every prepared layer keyed so
// switching a part's option/sliders never re-triggers a recolour, and only
// the layers currently on screen are recoloured when the skin tone
// changes — everything else is prepared lazily, the first time it's
// actually selected.
//
// Which layers get recoloured, shifted, or tinted is driven entirely by
// the manifest's skinLayers / skinShift / "*.tint" suffix (mouths
// addendum, section 3.2) — not by hardcoding eyes/nose/mouth by name.

import { recolorSkin, shiftTowardSkin, tintLayer } from "./recolor.js";
import { derivePartTypes, SUB_LAYERS } from "./parts.js";

const ASSET_BASE = "/character-assets";

// The full-canvas base recolour is the expensive one (~6MB each) — cap how
// many stay resident and evict the least recently used. Small part layers
// (eyes/nose/mouth skin & color, eyebrow tint) are cheap and numerous
// combinations are plausible during a session, so they're left unbounded.
const MAX_BASE_CACHE = 4;

class LRUCache {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
  set(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.maxSize) {
      this.map.delete(this.map.keys().next().value);
    }
  }
}

const imageCache = new Map(); // url -> Promise<HTMLImageElement>
const baseSkinCache = new LRUCache(MAX_BASE_CACHE); // "file|toneId" -> HTMLCanvasElement
const partSkinCache = new Map(); // "file|toneId" -> HTMLCanvasElement
const shiftCache = new Map(); // "file|toneId|amount" -> HTMLCanvasElement
const tintCache = new Map(); // "file|color" -> HTMLCanvasElement

export function assetUrl(characterPath, relativeFile) {
  return `${ASSET_BASE}/${characterPath}/${relativeFile}`;
}

export function manifestUrl() {
  return `${ASSET_BASE}/manifest.json`;
}

export async function loadManifest() {
  const res = await fetch(manifestUrl());
  if (!res.ok) throw new Error("could not load the character creator's manifest");
  return res.json();
}

function loadImage(url) {
  if (imageCache.has(url)) return imageCache.get(url);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
  imageCache.set(url, promise);
  return promise;
}

function toCanvas(img) {
  const off = document.createElement("canvas");
  off.width = img.naturalWidth || img.width;
  off.height = img.naturalHeight || img.height;
  const octx = off.getContext("2d", { willReadFrequently: true });
  octx.drawImage(img, 0, 0);
  return { canvas: off, ctx: octx };
}

function recolorToCanvas(img, targetHex, skinReference) {
  if (!targetHex) return img; // as painted — no recolour needed, draw the source image directly
  const { canvas, ctx } = toCanvas(img);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  recolorSkin(pixels.data, targetHex, skinReference);
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

function shiftToCanvas(img, targetHex, skinReference, amount) {
  if (!targetHex || !amount) return img;
  const { canvas, ctx } = toCanvas(img);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  shiftTowardSkin(pixels.data, targetHex, skinReference, amount);
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

function tintToCanvas(img, colorHex) {
  const { canvas, ctx } = toCanvas(img);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  tintLayer(pixels.data, colorHex);
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

function findById(list, id) {
  return list.find((item) => item.id === id) ?? list[0];
}

/**
 * Resolve and prepare every layer a given state needs, returning a map
 * keyed by the character's layerOrder entries ("base", "eyes.skin", ...)
 * to { image, x, y, pivot? } ready for renderCharacter to draw.
 *
 * Generic over part types and their sub-layers: a part type is any key
 * appearing in layerOrder before the dot (derivePartTypes), and a part
 * may have any subset of skin/color/tint layers — whichever its chosen
 * option actually defines.
 */
export async function prepareLayers(character, state) {
  const path = character.path;
  const baseFile = character.base.replace("{ear}", state.ear);
  const tone = findById(character.skinTones, state.skinTone);
  const skinLayers = character.skinLayers ?? [];
  const skinShift = character.skinShift ?? {};
  const partTypes = derivePartTypes(character);

  // One job per (partType, subLayer) that the chosen option actually has.
  const jobs = [];
  for (const partType of partTypes) {
    const options = character[partType] ?? [];
    const def = findById(options, state[partType]?.id);
    if (!def) continue;
    for (const sub of SUB_LAYERS) {
      const info = def[sub];
      if (!info) continue;
      jobs.push({ layerKey: `${partType}.${sub}`, sub, info, pivot: def.pivot });
    }
  }

  const [baseImg, ...jobImgs] = await Promise.all([
    loadImage(assetUrl(path, baseFile)),
    ...jobs.map((j) => loadImage(assetUrl(path, j.info.file))),
  ]);

  const baseKey = `${baseFile}|${tone.id}`;
  let baseImage = baseSkinCache.get(baseKey);
  if (!baseImage) {
    baseImage = recolorToCanvas(baseImg, tone.target, character.skinReference);
    baseSkinCache.set(baseKey, baseImage);
  }

  const layers = { base: { image: baseImage, x: 0, y: 0 } };

  jobs.forEach((job, i) => {
    const img = jobImgs[i];
    let image = img;

    if (job.sub === "tint") {
      const key = `${job.info.file}|${state.browColor}`;
      image = tintCache.get(key);
      if (!image) {
        image = tintToCanvas(img, state.browColor);
        tintCache.set(key, image);
      }
    } else if (skinLayers.includes(job.layerKey)) {
      const key = `${job.info.file}|${tone.id}`;
      image = partSkinCache.get(key);
      if (!image) {
        image = recolorToCanvas(img, tone.target, character.skinReference);
        partSkinCache.set(key, image);
      }
    } else if (skinShift[job.layerKey]) {
      const amount = skinShift[job.layerKey];
      // A null target ("as painted") skips the skin recolour entirely, but
      // a shifted layer like the mouth still wants *some* lean toward the
      // tone's own identity rather than going fully untouched — fall back
      // to the tone's swatch (its own representative colour) in that case.
      const shiftTarget = tone.target ?? tone.swatch;
      const key = `${job.info.file}|${tone.id}|${amount}`;
      image = shiftCache.get(key);
      if (!image) {
        image = shiftToCanvas(img, shiftTarget, character.skinReference, amount);
        shiftCache.set(key, image);
      }
    }
    // else: a plain layer (e.g. eyes.color) — the loaded image as-is.

    layers[job.layerKey] = { image, x: job.info.x, y: job.info.y, pivot: job.pivot };
  });

  return layers;
}
