// Pure drawing function for the character creator (gameplan section 4.1).
// No DOM access beyond the canvas context it's handed, no component
// state — given a state object, the manifest, and layers already prepared
// by layerCache.prepareLayers, it just draws. This separation is what lets
// the UI be thrown away and rebuilt later without touching this file.

export function renderCharacter(ctx, state, manifest, layers) {
  const character = manifest.characters[`${state.race}_${state.bodyType}`];
  if (!character) return;

  ctx.clearRect(0, 0, manifest.canvas.width, manifest.canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const partStateFor = (layerKey) => {
    const dot = layerKey.indexOf(".");
    if (dot === -1) return null; // "base" has no part type, no transform
    return state[layerKey.slice(0, dot)] ?? null;
  };

  for (const layerKey of character.layerOrder) {
    const layer = layers[layerKey];
    if (!layer || !layer.image) continue;

    const partState = partStateFor(layerKey);

    if (!partState || !layer.pivot) {
      // The base has no crop offset beyond (0,0) and no slider transform.
      ctx.drawImage(layer.image, layer.x, layer.y);
      continue;
    }

    const [pivotX, pivotY] = layer.pivot;
    ctx.save();
    ctx.translate(pivotX + partState.x, pivotY + partState.y);
    ctx.rotate((partState.rotation * Math.PI) / 180);
    ctx.scale(partState.scale, partState.scale);
    ctx.translate(-pivotX, -pivotY);
    ctx.drawImage(layer.image, layer.x, layer.y);
    ctx.restore();
  }
}
