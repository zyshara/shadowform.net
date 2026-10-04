import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CharacterCreator from "@/characterCreator/CharacterCreator.jsx";
import { loadManifest } from "@/characterCreator/layerCache.js";
import { defaultStateFor, sanitizeState } from "@/characterCreator/state.js";

// Stage A (gameplan section 7, build order step 5): no backend. Create
// downloads the PNG + JSON pair, and "Load JSON" restores a saved state —
// enough to fully exercise the creator on its own before it's wired into
// the activity/submission system in Stage B.
const CharacterCreatorDev = () => {
  const [manifest, setManifest] = useState(null);
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [savedPreview, setSavedPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadManifest()
      .then((m) => {
        setManifest(m);
        const enabledBody = m.bodyTypes.find((b) => b.enabled)?.id;
        const enabledRace = m.races.find((r) => r.enabled)?.id;
        setState(defaultStateFor(m, enabledBody, enabledRace));
      })
      .catch((err) => setError(err.message));
  }, []);

  function handleLoadJsonClick() {
    fileInputRef.current?.click();
  }

  function handleLoadJsonFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !manifest) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const sanitized = sanitizeState(manifest, parsed);
        if (sanitized) setState(sanitized);
      } catch {
        setError("That file isn't valid character JSON.");
      }
    };
    reader.readAsText(file);
  }

  function handleCreate(blob, finalState) {
    const pngUrl = URL.createObjectURL(blob);
    const pngLink = document.createElement("a");
    pngLink.href = pngUrl;
    pngLink.download = "character.png";
    pngLink.click();
    URL.revokeObjectURL(pngUrl);

    const json = JSON.stringify(finalState, null, 2);
    const jsonBlob = new Blob([json], { type: "application/json" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = "character.json";
    jsonLink.click();
    URL.revokeObjectURL(jsonUrl);

    setSavedPreview(URL.createObjectURL(blob));
  }

  return (
    <main className="min-h-dvh bg-gray-100 px-4 pt-6 pb-24 text-gray-900">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Character creator — dev</h1>
            <p className="text-xs text-gray-500">Stage A: no backend. Create downloads PNG + JSON.</p>
          </div>
          <Link to="/" className="text-sm text-gray-600 underline">
            Back to site
          </Link>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!manifest || !state ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <>
            <div>
              <button
                type="button"
                onClick={handleLoadJsonClick}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white cursor-pointer"
              >
                Load JSON
              </button>
              <input ref={fileInputRef} type="file" accept="application/json" onChange={handleLoadJsonFile} className="hidden" />
            </div>

            <CharacterCreator manifest={manifest} value={state} onChange={setState} onCreate={handleCreate} createLabel="Create" />

            {savedPreview && (
              <div className="border border-gray-300 rounded p-3 bg-white">
                <p className={`mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500`}>Last export</p>
                <img src={savedPreview} alt="" className="max-w-xs bg-[conic-gradient(#e5e5e5_90deg,#fff_90deg_180deg,#e5e5e5_180deg_270deg,#fff_270deg)] bg-[length:16px_16px]" />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default CharacterCreatorDev;
