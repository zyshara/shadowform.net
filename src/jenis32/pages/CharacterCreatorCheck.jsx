import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { loadManifest, prepareLayers } from "@/characterCreator/layerCache.js";
import { renderCharacter } from "@/characterCreator/renderer.js";
import { sanitizeState, getCharacter } from "@/characterCreator/state.js";

// Dev-only check (gameplan section 4.6): render each reference/*.json
// through the real renderer and diff it against the matching
// reference/*.png. "default" exercises plain stacking, "recolored"
// exercises the skin recolour, "adjusted" exercises the sliders.
const CASES = ["default", "recolored", "adjusted"];

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function diffCanvases(renderedCtx, referenceCtx, width, height) {
  const a = renderedCtx.getImageData(0, 0, width, height).data;
  const b = referenceCtx.getImageData(0, 0, width, height).data;
  let sum = 0;
  let max = 0;
  let count = 0;
  for (let i = 0; i < a.length; i += 4) {
    for (let c = 0; c < 4; c++) {
      const d = Math.abs(a[i + c] - b[i + c]);
      sum += d;
      if (d > max) max = d;
      count++;
    }
  }
  return { avg: sum / count, max };
}

const CharacterCreatorCheck = () => {
  const [manifest, setManifest] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const canvasRefs = useRef({});
  const refCanvasRefs = useRef({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await loadManifest();
        if (cancelled) return;
        setManifest(m);

        const out = {};
        for (const name of CASES) {
          const stateRes = await fetch(`/character-assets/reference/${name}.json`);
          const rawState = await stateRes.json();
          const state = sanitizeState(m, rawState);
          const character = getCharacter(m, state.bodyType, state.race);
          const prepared = await prepareLayers(m, character, state);

          const canvas = canvasRefs.current[name];
          const ctx = canvas.getContext("2d");
          renderCharacter(ctx, state, m, prepared);

          const refImg = await loadImage(`/character-assets/reference/${name}.png`);
          const refCanvas = refCanvasRefs.current[name];
          refCanvas.width = m.canvas.width;
          refCanvas.height = m.canvas.height;
          const refCtx = refCanvas.getContext("2d");
          refCtx.drawImage(refImg, 0, 0);

          out[name] = diffCanvases(ctx, refCtx, m.canvas.width, m.canvas.height);
        }
        if (!cancelled) setResults(out);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-dvh bg-gray-100 px-4 py-6 text-gray-900">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Character creator — reference check</h1>
          <Link to="/character" className="text-sm text-gray-600 underline">
            Back to creator
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!manifest && !error && <p className="text-sm text-gray-500">Loading…</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CASES.map((name) => (
            <div key={name} className="border border-gray-300 rounded p-3 bg-white">
              <p className="text-sm font-semibold mb-2">{name}</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">rendered</p>
                  <canvas
                    ref={(el) => (canvasRefs.current[name] = el)}
                    width={1024}
                    height={1536}
                    className="w-full border border-gray-200 bg-[conic-gradient(#e5e5e5_90deg,#fff_90deg_180deg,#e5e5e5_180deg_270deg,#fff_270deg)] bg-[length:16px_16px]"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">reference</p>
                  <canvas
                    ref={(el) => (refCanvasRefs.current[name] = el)}
                    width={1024}
                    height={1536}
                    className="w-full border border-gray-200 bg-[conic-gradient(#e5e5e5_90deg,#fff_90deg_180deg,#e5e5e5_180deg_270deg,#fff_270deg)] bg-[length:16px_16px]"
                  />
                </div>
              </div>
              {results?.[name] && (
                <p className="mt-2 text-xs text-gray-700">
                  avg diff/channel: <strong>{results[name].avg.toFixed(3)}</strong>, max: <strong>{results[name].max}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default CharacterCreatorCheck;
