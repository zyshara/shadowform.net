// Drawing functions for the character creator (gameplan section 4.1).
// Given a state object, the manifest, and layers already prepared by
// layerCache.prepareLayers, these just draw. This separation is what lets
// the UI be thrown away and rebuilt later without touching this file.

// Background, then every character layer in order, onto the given
// context — no frame. The single place the portrait itself is assembled;
// renderCharacter below calls this once directly (no frame) or once onto
// an offscreen canvas before wrapping it in a frame, so frame-handling
// never needs to know how a layer is drawn.
export function drawPortrait(ctx, state, manifest, prepared) {
  const character = manifest.characters[`${state.race}_${state.bodyType}`];
  if (!character) return;

  const { width, height } = manifest.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Background first — never recoloured, tinted, or transformed.
  const bg = prepared.background;
  if (bg?.image) {
    ctx.drawImage(bg.image, 0, 0, width, height);
  } else if (bg?.color) {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, width, height);
  }

  const partStateFor = (layerKey) => {
    const dot = layerKey.indexOf(".");
    if (dot === -1) return null; // "base" has no part type, no transform
    return state[layerKey.slice(0, dot)] ?? null;
  };

  for (const layerKey of character.layerOrder) {
    const layer = prepared.parts[layerKey];
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

// With no frame: draws the portrait straight onto the given canvas context,
// exactly as before. With a frame: assembles the full portrait on an
// offscreen canvas first (frames note, section 3), then scales it to
// *cover* the frame's window, centred and clipped to that rectangle, and
// finally draws the frame art on top at full size. The result is
// transparent outside the frame's outer edge — intended.
export function renderCharacter(ctx, state, manifest, prepared) {
  const frame = prepared.frame;
  const { width, height } = manifest.canvas;

  if (!frame) {
    drawPortrait(ctx, state, manifest, prepared);
    return;
  }

  const offscreen = document.createElement("canvas");
  offscreen.width = width;
  offscreen.height = height;
  drawPortrait(offscreen.getContext("2d"), state, manifest, prepared);

  ctx.clearRect(0, 0, width, height);

  const win = frame.window;
  const scale = Math.max(win.width / width, win.height / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  const dx = win.x + (win.width - drawWidth) / 2;
  const dy = win.y + (win.height - drawHeight) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(win.x, win.y, win.width, win.height);
  ctx.clip();
  ctx.drawImage(offscreen, dx, dy, drawWidth, drawHeight);
  ctx.restore();

  if (frame.image) {
    ctx.drawImage(frame.image, 0, 0, width, height);
  }
}
