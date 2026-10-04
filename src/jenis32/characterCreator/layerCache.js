// Asset loading + per-(file, variant) preparation cache for the character
// creator (gameplan section 4.5). Keeps every prepared layer keyed so
// switching eyes/nose/sliders never re-triggers a recolour, and only the
// three layers currently on screen (base, chosen eyes skin, chosen nose
// skin) are recoloured when the skin tone changes — everything else is
// prepared lazily, the first time it's actually selected.

import { recolorSkin, tintLayer } from "./recolor.js";

const ASSET_BASE = "/character-assets";

// The full-canvas base recolour is the expensive one (~6MB each) — cap how
// many stay resident and evict the least recently used. Small part layers
// (eyes/nose skin, eyebrow tint) are cheap and numerous combinations are
// plausible during a session, so they're left unbounded.
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
 */
export async function prepareLayers(character, state) {
  const path = character.path;
  const baseFile = character.base.replace("{ear}", state.ear);
  const eyesDef = findById(character.eyes, state.eyes.id);
  const noseDef = findById(character.nose, state.nose.id);
  const tone = findById(character.skinTones, state.skinTone);

  const [baseImg, eyesSkinImg, eyesColorImg, eyesTintImg, noseSkinImg, noseColorImg] = await Promise.all([
    loadImage(assetUrl(path, baseFile)),
    loadImage(assetUrl(path, eyesDef.skin.file)),
    loadImage(assetUrl(path, eyesDef.color.file)),
    loadImage(assetUrl(path, eyesDef.tint.file)),
    loadImage(assetUrl(path, noseDef.skin.file)),
    loadImage(assetUrl(path, noseDef.color.file)),
  ]);

  const baseKey = `${baseFile}|${tone.id}`;
  let baseImage = baseSkinCache.get(baseKey);
  if (!baseImage) {
    baseImage = recolorToCanvas(baseImg, tone.target, character.skinReference);
    baseSkinCache.set(baseKey, baseImage);
  }

  const eyesSkinKey = `${eyesDef.skin.file}|${tone.id}`;
  let eyesSkinImage = partSkinCache.get(eyesSkinKey);
  if (!eyesSkinImage) {
    eyesSkinImage = recolorToCanvas(eyesSkinImg, tone.target, character.skinReference);
    partSkinCache.set(eyesSkinKey, eyesSkinImage);
  }

  const noseSkinKey = `${noseDef.skin.file}|${tone.id}`;
  let noseSkinImage = partSkinCache.get(noseSkinKey);
  if (!noseSkinImage) {
    noseSkinImage = recolorToCanvas(noseSkinImg, tone.target, character.skinReference);
    partSkinCache.set(noseSkinKey, noseSkinImage);
  }

  const tintKey = `${eyesDef.tint.file}|${state.browColor}`;
  let eyesTintImage = tintCache.get(tintKey);
  if (!eyesTintImage) {
    eyesTintImage = tintToCanvas(eyesTintImg, state.browColor);
    tintCache.set(tintKey, eyesTintImage);
  }

  return {
    base: { image: baseImage, x: 0, y: 0 },
    "eyes.skin": { image: eyesSkinImage, x: eyesDef.skin.x, y: eyesDef.skin.y, pivot: eyesDef.pivot },
    "eyes.color": { image: eyesColorImg, x: eyesDef.color.x, y: eyesDef.color.y, pivot: eyesDef.pivot },
    "eyes.tint": { image: eyesTintImage, x: eyesDef.tint.x, y: eyesDef.tint.y, pivot: eyesDef.pivot },
    "nose.skin": { image: noseSkinImage, x: noseDef.skin.x, y: noseDef.skin.y, pivot: noseDef.pivot },
    "nose.color": { image: noseColorImg, x: noseDef.color.x, y: noseDef.color.y, pivot: noseDef.pivot },
  };
}
