import React, { useEffect, useRef, useState } from "react";
import { prepareLayers } from "./layerCache.js";
import { renderCharacter } from "./renderer.js";
import { SLIDERS, DEFAULT_PART_STATE } from "./sliderConfig.js";
import { getCharacter, randomStateFor, slottedPartTypes, simplePartTypes, isOptional } from "./state.js";

// Draw order (from the manifest's layerOrder) isn't necessarily the order
// controls should appear in — hair draws on top of everything but the
// hair addendum asks for its picker after Mouth. This is a UI-only
// preference; any part type not listed here still renders, just appended
// at the end, so a future part type works without editing this list.
const PART_UI_ORDER = ["eyes", "nose", "mouth", "hair"];

function orderForUi(types) {
  return [...PART_UI_ORDER.filter((p) => types.includes(p)), ...types.filter((p) => !PART_UI_ORDER.includes(p))];
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Deliberately rudimentary (gameplan section 8): native controls, a
// neutral grey/white palette independent of the site's own theme tokens,
// no illustration work. It gets skinned later — what matters here is the
// rendering, the data, and keeping this file free of anything the real
// skin pass would need to fight.

const fieldLabel = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1";
const sectionBox = "border border-gray-300 rounded p-3 bg-white";
const optionBtn = (active, enabled = true) =>
  `px-3 py-1.5 text-sm rounded border cursor-pointer ${
    !enabled
      ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
      : active
        ? "border-gray-900 bg-gray-900 text-white"
        : "border-gray-300 bg-white text-gray-800 hover:border-gray-500"
  }`;

function PartSliders({ title, part, value, onChange, onReset }) {
  return (
    <div className={sectionBox}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <button type="button" onClick={onReset} className="text-xs text-gray-500 underline cursor-pointer">
          Reset
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {SLIDERS.map((s) => (
          <label key={s.key} className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-20 shrink-0">{s.label}</span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={value[s.key]}
              onChange={(e) => onChange(part, s.key, parseFloat(e.target.value))}
              className="flex-1 cursor-pointer"
            />
            <span className="w-10 shrink-0 text-right tabular-nums">{value[s.key]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ColorSwatches({ label, options, selectedId, onSelect, swatchOf = (o) => o.swatch }) {
  return (
    <div className={sectionBox}>
      <p className={fieldLabel}>{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSelect(o.id)}
            title={o.name}
            aria-label={o.name}
            className={`w-8 h-8 rounded-full border-2 cursor-pointer ${selectedId === o.id ? "border-gray-900 scale-110" : "border-gray-300"}`}
            style={{ backgroundColor: swatchOf(o) }}
          />
        ))}
      </div>
    </div>
  );
}

const CharacterCreator = ({ manifest, value, onChange, onCreate, creating = false, createLabel = "Create", createError = null }) => {
  const canvasRef = useRef(null);
  const layersRef = useRef(null);
  const stateRef = useRef(value);
  const rafRef = useRef(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(null);

  stateRef.current = value;

  const character = getCharacter(manifest, value.bodyType, value.race);
  const slotted = character ? orderForUi(slottedPartTypes(character)) : [];
  const simple = character ? orderForUi(simplePartTypes(character)) : [];
  const allParts = [...slotted, ...simple];

  function scheduleRedraw() {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!layersRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      renderCharacter(ctx, stateRef.current, manifest, layersRef.current);
    });
  }

  // Layer preparation is async (image loads + recolours) and only depends
  // on which images are needed — switching a part's id, skin tone, eye
  // colour, or hair colour. Slider values don't change which images are
  // needed, so they're handled by scheduleRedraw() below without re-running
  // this.
  useEffect(() => {
    if (!character) return;
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    prepareLayers(character, value)
      .then((prepared) => {
        if (cancelled) return;
        layersRef.current = prepared;
        setPreviewLoading(false);
        scheduleRedraw();
      })
      .catch((err) => {
        if (cancelled) return;
        setPreviewError(err.message);
        setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, value.skinTone, value.eyeColor, value.hairColor, ...allParts.map((p) => value[p]?.id)]);

  useEffect(() => {
    scheduleRedraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, slotted.flatMap((p) => [value[p]?.x, value[p]?.y, value[p]?.scale, value[p]?.rotation]));

  if (!character) {
    return <p className="text-sm text-red-600">This character isn't available yet.</p>;
  }

  function set(patch) {
    onChange({ ...value, ...patch });
  }

  function setPartField(part, key, val) {
    onChange({ ...value, [part]: { ...value[part], [key]: val } });
  }

  function setSimplePart(part, id) {
    onChange({ ...value, [part]: id ? { id } : null });
  }

  function resetPart(part) {
    onChange({ ...value, [part]: { id: value[part].id, ...DEFAULT_PART_STATE } });
  }

  function handleRandomize() {
    const next = randomStateFor(manifest, value.bodyType, value.race);
    if (next) onChange(next);
  }

  function handleResetAll() {
    const next = {
      version: 2,
      bodyType: value.bodyType,
      race: value.race,
      skinTone: character.defaults.skinTone,
      eyeColor: character.defaults.eyeColor,
      hairColor: character.defaults.hairColor,
    };
    for (const partType of slotted) {
      next[partType] = { id: character.defaults[partType], ...DEFAULT_PART_STATE };
    }
    for (const partType of simple) {
      const d = character.defaults[partType];
      next[partType] = d ? { id: d } : null;
    }
    onChange(next);
  }

  async function handleCreate() {
    const canvas = canvasRef.current;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    onCreate?.(blob, value);
  }

  return (
    <div className="flex flex-col gap-5 text-gray-900">
      {/* Step 1 — body type */}
      <div className={sectionBox}>
        <p className={fieldLabel}>1. Body type</p>
        <div className="flex gap-2 flex-wrap">
          {manifest.bodyTypes.map((b) => (
            <button
              key={b.id}
              type="button"
              disabled={!b.enabled}
              onClick={() => b.enabled && set({ bodyType: b.id })}
              className={optionBtn(value.bodyType === b.id, b.enabled)}
            >
              {b.name}{!b.enabled && " (coming soon)"}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — race */}
      <div className={sectionBox}>
        <p className={fieldLabel}>2. Race</p>
        <div className="flex gap-2 flex-wrap">
          {manifest.races.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={!r.enabled}
              onClick={() => r.enabled && set({ race: r.id })}
              className={optionBtn(value.race === r.id, r.enabled)}
            >
              {r.name}{!r.enabled && " (coming soon)"}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 — customize */}
      <div className="flex flex-col md:flex-row gap-5">
        <div className="md:w-72 shrink-0 sticky top-0 self-start z-10 bg-gray-100 pb-2">
          <div
            className="relative mx-auto h-[38vh] w-auto md:h-auto md:w-full border border-gray-300 rounded bg-[conic-gradient(#e5e5e5_90deg,#fff_90deg_180deg,#e5e5e5_180deg_270deg,#fff_270deg)] bg-[length:24px_24px] overflow-hidden"
            style={{ aspectRatio: `${manifest.canvas.width} / ${manifest.canvas.height}` }}
          >
            <canvas
              ref={canvasRef}
              width={manifest.canvas.width}
              height={manifest.canvas.height}
              className="w-full h-full"
            />
            {previewLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-gray-600">
                Loading…
              </div>
            )}
          </div>
          {previewError && <p className="mt-2 text-xs text-red-600">{previewError}</p>}
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <p className={fieldLabel}>3. Customize</p>

          <ColorSwatches
            label="Skin tone"
            options={character.skinTones}
            selectedId={value.skinTone}
            onSelect={(id) => set({ skinTone: id })}
          />

          {slotted.map((partType) => (
            <React.Fragment key={partType}>
              <div className={sectionBox}>
                <p className={fieldLabel}>{capitalize(partType)}</p>
                <div className="flex gap-2 flex-wrap">
                  {(character[partType] ?? []).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPartField(partType, "id", opt.id)}
                      className={optionBtn(value[partType]?.id === opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {partType === "eyes" && character.eyeColors && (
                <ColorSwatches
                  label="Eye colour"
                  options={character.eyeColors}
                  selectedId={value.eyeColor}
                  onSelect={(id) => set({ eyeColor: id })}
                />
              )}

              <PartSliders
                title={`Adjust ${partType}`}
                part={partType}
                value={value[partType]}
                onChange={setPartField}
                onReset={() => resetPart(partType)}
              />
            </React.Fragment>
          ))}

          {simple.map((partType) => {
            const optional = isOptional(character, partType);
            return (
              <div key={partType} className={sectionBox}>
                <p className={fieldLabel}>{capitalize(partType)}</p>
                <div className="flex gap-2 flex-wrap">
                  {(character[partType] ?? []).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSimplePart(partType, opt.id)}
                      className={optionBtn(value[partType]?.id === opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                  {optional && (
                    <button
                      type="button"
                      onClick={() => setSimplePart(partType, null)}
                      className={optionBtn(!value[partType])}
                    >
                      None
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {character.hairColors && (
            <ColorSwatches
              label="Hair colour"
              options={character.hairColors}
              selectedId={value.hairColor}
              onSelect={(id) => set({ hairColor: id })}
              swatchOf={(o) => o.color}
            />
          )}

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button type="button" onClick={handleRandomize} className={optionBtn(false)}>
              Randomize
            </button>
            <button type="button" onClick={handleResetAll} className={optionBtn(false)}>
              Reset all
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || previewLoading}
              className="ml-auto px-5 py-2 text-sm rounded bg-gray-900 text-white disabled:opacity-50 cursor-pointer"
            >
              {creating ? "Saving…" : createLabel}
            </button>
          </div>
          {createError && <p className="text-xs text-red-600">{createError}</p>}
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;
