import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Eraser from "@/components/icons/Eraser";
import { useAuth } from "@/context/AuthContext";

// Small fixed palette rather than a full picker — gameplan section 6 asks
// for "small palette (include the site pink), 3 brush sizes, eraser,
// undo, clear", nothing fancier.
const COLORS = [
  { name: "Ink", value: "#241b22" },
  { name: "Pink", value: "#f4a7c3" },
  { name: "Red", value: "#ff6b6b" },
  { name: "Sky", value: "#4ea8de" },
  { name: "Gold", value: "#ffd166" },
  { name: "Mint", value: "#06d6a0" },
];

const SIZES = [
  { label: "Small", value: 3, dot: 6 },
  { label: "Medium", value: 7, dot: 10 },
  { label: "Large", value: 14, dot: 14 },
];

const ERASER_SIZE = 24;
const CANVAS_BG = "#ffffff";

function drawStroke(ctx, stroke) {
  const { color, size, points } = stroke;
  if (!points || points.length === 0) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 1) {
    // A tap with no drag — draw a dot so it isn't lost.
    ctx.lineTo(points[0].x + 0.1, points[0].y + 0.1);
  } else {
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

const DrawingActivity = ({ activity, initialStrokes = null, onSave }) => {
  const { jwt } = useAuth();
  const canvasRef = useRef(null);
  const dimsRef = useRef({ width: 0, height: 0 });
  const currentStrokeRef = useRef(null);
  const isDrawingRef = useRef(false);

  const [strokes, setStrokes] = useState(
    Array.isArray(initialStrokes) ? initialStrokes : []
  );
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(SIZES[1].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function redraw(strokesToDraw) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = dimsRef.current;
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, width, height);
    strokesToDraw.forEach((s) => drawStroke(ctx, s));
  }

  // Size the canvas backing store for devicePixelRatio before the first
  // paint, so the mount-time redraw below has real dimensions to work with.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.getContext("2d").scale(dpr, dpr);
    dimsRef.current = { width: rect.width, height: rect.height };
  }, []);

  useEffect(() => {
    redraw(strokes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes]);

  function getPoint(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e) {
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    currentStrokeRef.current = {
      color: tool === "eraser" ? CANVAS_BG : color,
      size: tool === "eraser" ? ERASER_SIZE : size,
      points: [getPoint(e)],
    };
    isDrawingRef.current = true;
  }

  function handlePointerMove(e) {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const point = getPoint(e);
    const stroke = currentStrokeRef.current;
    const prev = stroke.points[stroke.points.length - 1];
    stroke.points.push(point);

    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const stroke = currentStrokeRef.current;
    currentStrokeRef.current = null;
    if (stroke && stroke.points.length > 0) {
      setStrokes((prev) => [...prev, stroke]);
    }
  }

  function handleUndo() {
    setStrokes((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    setStrokes([]);
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const canvas = canvasRef.current;
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("could not export your drawing");

      const formData = new FormData();
      formData.append("file", blob, "drawing.png");
      formData.append("strokes", JSON.stringify(strokes));

      const res = await fetch(`/api/jenis32/submissions/${activity.slug}/drawing`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not save your drawing");
      onSave?.(data.submission);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-j32-border">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => { setTool("pen"); setColor(c.value); }}
              aria-label={c.name}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
                tool === "pen" && color === c.value ? "border-j32-accent scale-110" : "border-j32-border"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
          <button
            type="button"
            onClick={() => setTool("eraser")}
            aria-label="Eraser"
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-j32-heading cursor-pointer ${
              tool === "eraser" ? "border-j32-accent" : "border-j32-border"
            }`}
          >
            <Eraser size={14} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSize(s.value)}
              aria-label={s.label}
              className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                size === s.value ? "border-j32-accent bg-j32-card" : "border-j32-border"
              }`}
            >
              <span
                className="rounded-full bg-j32-heading"
                style={{ width: s.dot, height: s.dot }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="text-xs text-j32-text/70 hover:text-j32-heading disabled:opacity-40 cursor-pointer"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="text-xs text-j32-text/70 hover:text-j32-heading disabled:opacity-40 cursor-pointer"
        >
          Clear
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="button" variant="primary" onClick={handleSubmit} disabled={saving} className="w-full">
        {saving ? "Saving…" : "Save and continue →"}
      </Button>
    </div>
  );
};

export default DrawingActivity;
