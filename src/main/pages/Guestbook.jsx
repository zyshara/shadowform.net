// src/main/pages/Guestbook.jsx

import { useState, useEffect, useRef } from "react";
import Ornament from "@/components/Ornament";
import Header from "@/components/Header";
import Tag from "@/components/Tag";
import Spinner from "@/components/Spinner";

const MIN_LOAD_MS = 1500;
const FADE_MS     = 400;

// ── Drawing Modal ─────────────────────────────────────────────────────────────
// ── Drawing Modal ─────────────────────────────────────────────────────────────
const DrawModal = ({ onClose, onAttach }) => {
  const canvasRef  = useRef(null);
  const atrRef     = useRef(null);
  const strokesRef = useRef([]);      // for undo
  const [color,    setColorState]  = useState("#f4a7c3");
  const [weight,   setWeightState] = useState(3);
  const [mode,     setModeState]   = useState("draw"); // "draw" | "erase"
  const [canUndo,  setCanUndo]     = useState(false);

  useEffect(() => {
    let destroyed = false;
    (async () => {
      const { default: Atrament } = await import("atrament");
      if (destroyed || !canvasRef.current) return;
      const cvs     = canvasRef.current;
      cvs.width     = cvs.offsetWidth;
      cvs.height    = cvs.offsetHeight;
      const atr     = new Atrament(cvs, {
        color:          "#f4a7c3",
        weight:         3,
        smoothing:      0.85,
        adaptiveStroke: true,
      });
      atr.recordStrokes = true;
      atrRef.current = atr;

      // track strokes for undo
      atr.addEventListener("strokerecorded", ({ stroke }) => {
        if (atr.recordPaused) return;
        strokesRef.current = [...strokesRef.current, stroke];
        setCanUndo(true);
      });
    })();
    return () => { destroyed = true; atrRef.current?.destroy?.(); };
  }, []);

  const setColor = (c) => {
    setColorState(c);
    if (atrRef.current) { atrRef.current.color = c; atrRef.current.mode = "draw"; setModeState("draw"); }
  };

  const setWeight = (w) => {
    setWeightState(w);
    if (atrRef.current) atrRef.current.weight = w;
  };

  const toggleErase = () => {
    if (!atrRef.current) return;
    const next = mode === "erase" ? "draw" : "erase";
    atrRef.current.mode = next;
    setModeState(next);
  };

const replayStrokes = (strokes, currentMode, currentColor, currentWeight) => {
  const atr = atrRef.current;
  const ctx = canvasRef.current?.getContext("2d");
  if (!atr || !ctx) return;

  ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  atr.recordPaused = true;

  for (const stroke of strokes) {
    atr.mode           = stroke.mode;
    atr.weight         = stroke.weight;
    atr.smoothing      = stroke.smoothing;
    atr.color          = stroke.color;
    atr.adaptiveStroke = stroke.adaptiveStroke;

    const segments   = stroke.segments.slice();
    const firstPoint = segments.shift().point;
    atr.beginStroke(firstPoint.x, firstPoint.y);
    let prevPoint = firstPoint;

    while (segments.length > 0) {
      const point     = segments.shift().point;
      const { x, y } = atr.draw(point.x, point.y, prevPoint.x, prevPoint.y);
      prevPoint       = { x, y };
    }

    atr.endStroke(prevPoint.x, prevPoint.y);
  }

  atr.recordPaused  = false;
  atr.mode          = currentMode;
  atr.color         = currentColor;
  atr.weight        = currentWeight;
};

const undo = () => {
  const next = strokesRef.current.slice(0, -1);
  strokesRef.current = next;
  setCanUndo(next.length > 0);
  replayStrokes(next, mode, color, weight);
};

  const clear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    strokesRef.current = [];
    setCanUndo(false);
  };

  const attach = () => {
    if (!canvasRef.current) return;
    onAttach(canvasRef.current.toDataURL("image/png"));
  };

  const COLORS  = ["#f4a7c3","#e8a0c0","#c8b8cc","#e8e0ec","#3e2848","#1a0d14"];
  const WEIGHTS = [{ v:2, label:"·" }, { v:4, label:"●" }, { v:9, label:"●●" }];

  return (
    <>
      <style>{`
        .modal-overlay{position:fixed;inset:0;background:rgba(6,3,9,.88);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px;}
        .draw-modal{background:var(--bg);border:1px solid var(--border-soft);border-radius:4px;width:100%;max-width:500px;display:flex;flex-direction:column;overflow:hidden;}
        .draw-modal-bar{background:var(--bg-ticker);border-bottom:1px solid var(--border-soft);padding:6px 12px;display:flex;align-items:center;justify-content:space-between;}
        .draw-canvas{width:100%;height:280px;display:block;background:var(--bg-sidebar);cursor:crosshair;touch-action:none;}
        .draw-modal-ft{background:var(--bg-ticker);border-top:1px solid var(--border-soft);padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
      `}</style>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="draw-modal">
          <div className="draw-modal-bar">
            <span className="font-alkhemikal text-[8px] tracking-[.14em] uppercase" style={{ color:"var(--pink-text)" }}>✦ draw something</span>
            <button onClick={onClose} style={{ color:"var(--text-nav-inactive)", background:"none", border:"none", cursor:"pointer", fontFamily:"monospace", fontSize:14 }}>✕</button>
          </div>
          <canvas ref={canvasRef} className="draw-canvas" style={{ cursor: mode === "erase" ? "cell" : "crosshair" }} />
          <div className="draw-modal-ft">
            <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
              {/* color swatches */}
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} title={c} style={{
                  width:14, height:14, borderRadius:"50%", background:c,
                  border: c === color && mode === "draw" ? "2px solid var(--pink-text)" : "1px solid var(--border-soft)",
                  cursor:"pointer",
                }} />
              ))}
              <div style={{ width:1, height:14, background:"var(--border-soft)", margin:"0 2px" }} />
              {/* weight */}
              {WEIGHTS.map(({ v, label }) => (
                <button key={v} onClick={() => setWeight(v)} style={{
                  color: v === weight ? "var(--pink-text)" : "var(--text-nav-inactive)",
                  background:"none", border:"none", cursor:"pointer",
                  fontSize: v === 9 ? 10 : 8, fontFamily:"monospace",
                }}>{label}</button>
              ))}
              <div style={{ width:1, height:14, background:"var(--border-soft)", margin:"0 2px" }} />
              {/* eraser */}
              <button onClick={toggleErase}
                className="font-alkhemikal text-[7px] tracking-[.1em] uppercase px-2 py-1 rounded-[2px] border"
                style={{
                  color:       mode === "erase" ? "var(--pink-text)"   : "var(--text-nav-inactive)",
                  borderColor: mode === "erase" ? "var(--pink-border)" : "var(--border-soft)",
                  background:  mode === "erase" ? "var(--pink-bg)"     : "transparent",
                  cursor:"pointer",
                }}>erase</button>
              {/* undo */}
              <button onClick={undo} disabled={!canUndo}
                className="font-alkhemikal text-[7px] tracking-[.1em] uppercase px-2 py-1 rounded-[2px] border"
                style={{
                  color: canUndo ? "var(--text-nav-inactive)" : "var(--border-soft)",
                  borderColor:"var(--border-soft)", background:"transparent",
                  cursor: canUndo ? "pointer" : "default",
                }}>undo</button>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={clear}
                className="font-alkhemikal text-[7px] tracking-[.1em] uppercase px-2 py-1 rounded-[2px] border"
                style={{ color:"var(--text-nav-inactive)", borderColor:"var(--border-soft)", background:"transparent", cursor:"pointer" }}>
                clear
              </button>
              <button onClick={attach}
                className="font-alkhemikal text-[7px] tracking-[.1em] uppercase px-2 py-1 rounded-[2px] border"
                style={{ color:"var(--pink-text)", borderColor:"var(--pink-border)", background:"var(--pink-bg)", cursor:"pointer" }}>
                attach ✦
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Drawing Lightbox (desktop only) ──────────────────────────────────────────
const DrawingLightbox = ({ src, onClose }) => (
  <>
    <style>{`
      .lightbox-overlay{position:fixed;inset:0;background:rgba(6,3,9,.92);z-index:50;display:flex;align-items:center;justify-content:center;padding:40px;cursor:pointer;}
      .lightbox-inner{max-width:600px;width:100%;display:flex;flex-direction:column;gap:12px;cursor:default;}
      .lightbox-img{width:100%;border-radius:2px;border:1px solid var(--border-soft);}
    `}</style>
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ color:"var(--text-nav-inactive)", background:"none", border:"none", cursor:"pointer", fontFamily:"monospace", fontSize:14 }}>✕</button>
        </div>
        <img src={src} alt="drawing" className="lightbox-img" style={{ background:"var(--bg-sidebar)" }} />
      </div>
    </div>
  </>
);

// ── Entry Card ────────────────────────────────────────────────────────────────
const EntryCard = ({ entry }) => {
  const [lightbox, setLightbox] = useState(false);
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 640;

  return (
    <>
      {lightbox && entry.drawing && (
        <DrawingLightbox src={entry.drawing} onClose={() => setLightbox(false)} />
      )}

      <div
        className="flex items-start gap-4 p-4 border rounded-[2px]"
        style={{ background:"var(--bg-ticker)", borderColor:"var(--border-soft)" }}
      >
        {/* desktop thumbnail — clickable to open lightbox */}
        <div
          className="hidden sm:flex w-16 h-16 flex-shrink-0 items-center justify-center rounded-[2px] border overflow-hidden"
          style={{
            background:"var(--bg-sidebar)", borderColor:"var(--border)",
            cursor: entry.drawing ? "pointer" : "default",
          }}
          onClick={() => entry.drawing && setLightbox(true)}
        >
          {entry.drawing
            ? <img src={entry.drawing} alt="doodle" className="w-full h-full object-contain" />
            : <span className="font-alagard text-[18px]" style={{ color:"var(--ornament-glyph)" }}>✿</span>
          }
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* name + date */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-alagard text-[16px] tracking-[1px] leading-tight lowercase" style={{ color:"var(--text-heading)" }}>
              {entry.name}
            </h3>
            <span className="font-alkhemikal text-[10px] tracking-[.1em] uppercase flex-shrink-0" style={{ color:"var(--text-nav-inactive)" }}>
              {entry.date}
            </span>
          </div>

          {/* website */}
          {entry.website && (
            <a href={entry.website} target="_blank" rel="noreferrer"
              className="font-alkhemikal text-[10px] tracking-[.1em] uppercase mb-1"
              style={{ color:"var(--text-nav-inactive)" }}>{entry.website}</a>
          )}

          {/* message */}
          {entry.message && (
            <p className="font-fell text-[12px] leading-[1.75]" style={{ color:"var(--text-body)" }}>
              {entry.message}
            </p>
          )}

          {/* tags */}
          {entry.tags?.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-auto pt-3">
              {entry.tags.map((t) => (
                <Tag key={t.label} theme={t.theme} variant="lit">{t.label}</Tag>
              ))}
            </div>
          )}

          {/* mobile drawing strip */}
          {entry.drawing && (
            <div
              className="sm:hidden mt-3 w-full h-28 rounded-[2px] border overflow-hidden"
              style={{ background:"var(--bg-sidebar)", borderColor:"var(--border)" }}
            >
              <img src={entry.drawing} alt="doodle" className="w-full h-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ── Guestbook Page ────────────────────────────────────────────────────────────
const Guestbook = () => {
  const [entries,    setEntries]    = useState([]);
  const [availTags,  setAvailTags]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fading,     setFading]     = useState(false);
  const [submitErr,  setSubmitErr]  = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [showDraw,   setShowDraw]   = useState(false);

  const [name,     setName]     = useState("");
  const [website,  setWebsite]  = useState("");
  const [message,  setMessage]  = useState("");
  const [selTags,  setSelTags]  = useState([]);
  const [drawing,  setDrawing]  = useState(null);

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const start = Date.now();
    Promise.all([
      fetch("/api/guestbook").then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
      fetch("/api/guestbook/tags").then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }),
    ])
      .then(([gbData, tagData]) => {
        setEntries(gbData.guestbook?.guestbook_entries ?? []);
        setAvailTags(tagData.tags ?? []);
        const remaining = Math.max(0, MIN_LOAD_MS - (Date.now() - start));
        setTimeout(() => { setFading(true); setTimeout(() => setLoading(false), FADE_MS); }, remaining);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleTag = (tag) =>
    setSelTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true); setSubmitErr(null);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), website: website.trim(), message: message.trim(), tags: selTags, drawing: drawing ?? null }),
      });
      if (res.status === 429) throw new Error("too many posts — try again later");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { entry } = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setName(""); setWebsite(""); setMessage(""); setSelTags([]); setDrawing(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (e) {
      setSubmitErr(e.message);
      setTimeout(() => setSubmitErr(null), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col min-h-full" style={{ background:"var(--bg)" }}>
      <div className="flex-1 flex items-center justify-center"
        style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out` }}>
        <Spinner />
      </div>
    </div>
  );

  return (
    <>
      {showDraw && (
        <DrawModal
          onClose={() => setShowDraw(false)}
          onAttach={(dataUrl) => { setDrawing(dataUrl); setShowDraw(false); }}
        />
      )}

      <div className="flex flex-col max-w-600 w-full min-h-full" style={{ background:"var(--bg)" }}>
        <div className="flex-1 flex flex-col px-10 py-8 max-w-[640px] w-full mx-auto">

          <Header eyebrow="guestbook" title="sign the book"
            description="leave a message, a drawing, or whatever's on your mind!" />

          {/* ── form card ── */}
          <div className="mt-6 flex flex-col gap-4 p-5 border rounded-[2px] mb-8"
            style={{ background:"var(--bg-ticker)", borderColor:"var(--border-soft)" }}>

            {/* name + website */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label:"name (required)", value:name, set:setName, placeholder:"your name...", required:true },
                { label:"website", value:website, set:setWebsite, placeholder:"optional" },
              ].map(({ label, value, set, placeholder, required }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="font-alkhemikal text-[10px] tracking-[.16em] uppercase" style={{ color:"var(--text-nav-inactive)" }}>
                    {label}{required && <span style={{ color:"var(--pink-text)" }}> *</span>}
                  </label>
                  <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                    className="font-fell text-[13px] bg-transparent border-b outline-none pb-[2px]"
                    style={{ color:"var(--text-body)", borderColor:"var(--border-soft)" }} />
                </div>
              ))}
            </div>

            {/* message */}
            <div className="flex flex-col gap-1">
              <label className="font-alkhemikal text-[10px] tracking-[.16em] uppercase" style={{ color:"var(--text-nav-inactive)" }}>message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="say something..." rows={2}
                className="font-fell text-[13px] bg-transparent border-b outline-none resize-none leading-[1.7] pb-[2px]"
                style={{ color:"var(--text-body)", borderColor:"var(--border-soft)" }} />
            </div>

            {/* tags */}
            {availTags.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="font-alkhemikal text-[10px] tracking-[.16em] uppercase" style={{ color:"var(--text-nav-inactive)" }}>tags</label>
                <div className="flex gap-2 flex-wrap">
                  {availTags.map((tag) => (
                    <Tag
                      key={tag.label}
                      variant={selTags.includes(tag) ? "lit" : "dim"}
                      theme={tag.theme}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag.label}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* drawing */}
            <div className="flex flex-col gap-2">
              <label className="font-alkhemikal text-[10px] tracking-[.16em] uppercase" style={{ color:"var(--text-nav-inactive)" }}>draw something</label>
              {drawing ? (
                <div className="flex items-center gap-3">
                  <img src={drawing} alt="your drawing"
                    className="w-14 h-14 object-contain rounded-[2px] border"
                    style={{ borderColor:"var(--border-soft)", background:"var(--bg-sidebar)" }} />
                  <div className="flex flex-col gap-1">
                    <span className="font-fell text-[11px]" style={{ color:"var(--pink-text)" }}>drawing attached ✦</span>
                    <button onClick={() => setShowDraw(true)} className="font-alkhemikal text-[10px] tracking-[.1em] uppercase"
                      style={{ color:"var(--pink-text)", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>redraw</button>
                    <button onClick={() => setDrawing(null)} className="font-alkhemikal text-[10px] tracking-[.1em] uppercase"
                      style={{ color:"var(--text-nav-inactive)", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>remove</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowDraw(true)}
                  className="font-alkhemikal text-[10px] tracking-[.1em] uppercase px-3 py-2 rounded-[2px] border self-start"
                  style={{ color:"var(--pink-text)", borderColor:"var(--pink-border)", background:"var(--pink-bg)", cursor:"pointer" }}>
                  ✦ open drawing pad
                </button>
              )}
            </div>

            {/* submit */}
            <div className="flex items-center gap-4 pt-1">
              <button onClick={handleSubmit} disabled={submitting || !name.trim()}
                className="font-alkhemikal text-[10px] tracking-[.12em] uppercase px-4 py-2 rounded-[2px] border"
                style={{
                  color:"var(--pink-text)", borderColor:"var(--pink-border)", background:"var(--pink-bg)",
                  cursor: name.trim() ? "pointer" : "not-allowed",
                  opacity: name.trim() ? 1 : 0.4,
                }}>
                {submitting ? "signing..." : "sign ✦"}
              </button>
              {submitted  && <span className="font-fell italic text-[12px]" style={{ color:"var(--pink-text)" }}>✦ signed!</span>}
              {submitErr  && <span className="font-fell italic text-[12px]" style={{ color:"var(--pink-text)" }}>{submitErr}</span>}
            </div>
          </div>

          {/* ── entries ── */}
          <div className="flex items-center gap-3 mb-4">
            <span className="font-alkhemikal text-[10px] tracking-[.2em] uppercase" style={{ color:"var(--ornament-glyph)" }}>✦ &nbsp; entries</span>
            <div className="flex-1 h-px" style={{ background:"linear-gradient(to right, var(--ornament-line), transparent)" }} />
          </div>

          {entries.length === 0
            ? <p className="font-fell italic text-[13px]" style={{ color:"var(--text-nav-inactive)" }}>no entries yet — be the first to sign.</p>
            : <div className="flex flex-col gap-3">{entries.map((e, i) => <EntryCard key={e.id ?? i} entry={e} />)}</div>
          }

          <Ornament className="mt-8 self-center" />
        </div>
      </div>
    </>
  );
};

export default Guestbook;
