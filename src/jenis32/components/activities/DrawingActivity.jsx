import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Eraser from "@/components/icons/Eraser";
import PaintBucket from "@/components/icons/PaintBucket";
import { useAuth } from "@/context/AuthContext";

const COLORS = [
  { name: "Ink", value: "#241b22" },
  { name: "White", value: "#ffffff" },
  { name: "Pink", value: "#f4a7c3" },
  { name: "Red", value: "#ff6b6b" },
  { name: "Orange", value: "#ff9f5a" },
  { name: "Gold", value: "#ffd166" },
  { name: "Mint", value: "#06d6a0" },
  { name: "Teal", value: "#2ec4b6" },
  { name: "Sky", value: "#4ea8de" },
  { name: "Purple", value: "#9b5de5" },
  { name: "Brown", value: "#8d5a44" },
  { name: "Grey", value: "#8a8a99" },
];

const SIZES = [
  { label: "Small", value: 3, dot: 6 },
  { label: "Medium", value: 7, dot: 10 },
  { label: "Large", value: 14, dot: 14 },
];

const ERASER_SIZE = 24;
const CANVAS_BG = "#ffffff";
const FILL_TOLERANCE = 32;

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

function hexToRGBA(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
    255,
  ];
}

// Stack-based 4-directional flood fill, operating directly on the canvas's
// pixel buffer (device pixels, unaffected by the DPR `ctx.scale`). Matches
// within a tolerance rather than exact color — strokes are drawn
// anti-aliased, so an exact match would leave a ring of unfilled fringe
// pixels around every line.
function floodFill(ctx, canvasWidth, canvasHeight, startX, startY, fillHex) {
  if (startX < 0 || startX >= canvasWidth || startY < 0 || startY >= canvasHeight) return;

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;
  const [fr, fg, fb, fa] = hexToRGBA(fillHex);

  const startIdx = (startY * canvasWidth + startX) * 4;
  const startR = data[startIdx];
  const startG = data[startIdx + 1];
  const startB = data[startIdx + 2];
  const startA = data[startIdx + 3];

  if (startR === fr && startG === fg && startB === fb && startA === fa) return;

  function matches(idx) {
    const dr = data[idx] - startR;
    const dg = data[idx + 1] - startG;
    const db = data[idx + 2] - startB;
    const da = data[idx + 3] - startA;
    return dr * dr + dg * dg + db * db + da * da <= FILL_TOLERANCE * FILL_TOLERANCE;
  }

  const visited = new Uint8Array(canvasWidth * canvasHeight);
  const stack = [[startX, startY]];

  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue;
    const pixelPos = y * canvasWidth + x;
    if (visited[pixelPos]) continue;
    const idx = pixelPos * 4;
    if (!matches(idx)) continue;
    visited[pixelPos] = 1;

    data[idx] = fr;
    data[idx + 1] = fg;
    data[idx + 2] = fb;
    data[idx + 3] = fa;

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
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
  const [customColor, setCustomColor] = useState("#c084fc");
  const [size, setSize] = useState(SIZES[1].value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Actions replay in order so a fill reproduces the same result it did
  // live — it floods whatever's already been drawn by the actions before it.
  function redraw(actions) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { width, height } = dimsRef.current;
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, width, height);
    for (const action of actions) {
      if (action.type === "fill") {
        floodFill(ctx, canvas.width, canvas.height, Math.round(action.point.x * dpr), Math.round(action.point.y * dpr), action.color);
      } else {
        drawStroke(ctx, action);
      }
    }
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
    const point = getPoint(e);

    if (tool === "fill") {
      setStrokes((prev) => [...prev, { type: "fill", color, point }]);
      return;
    }

    canvasRef.current.setPointerCapture?.(e.pointerId);
    currentStrokeRef.current = {
      type: "stroke",
      color: tool === "eraser" ? CANVAS_BG : color,
      size: tool === "eraser" ? ERASER_SIZE : size,
      points: [point],
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

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => { setTool((t) => (t === "fill" ? "fill" : "pen")); setColor(c.value); }}
              aria-label={c.name}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform shrink-0 ${
                color === c.value && tool !== "eraser" ? "border-j32-accent scale-110" : "border-j32-border"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}

          <label
            className="relative w-7 h-7 rounded-full border-2 cursor-pointer shrink-0 border-j32-border overflow-hidden"
            style={{
              background: color === customColor && tool !== "eraser"
                ? customColor
                : "conic-gradient(from 0deg, #ff6b6b, #ffd166, #06d6a0, #4ea8de, #9b5de5, #ff6b6b)",
            }}
            aria-label="Custom color"
          >
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setColor(e.target.value);
                setTool((t) => (t === "fill" ? "fill" : "pen"));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
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
            <button
              type="button"
              onClick={() => setTool("fill")}
              aria-label="Paint bucket"
              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-j32-heading cursor-pointer ${
                tool === "fill" ? "border-j32-accent" : "border-j32-border"
              }`}
            >
              <PaintBucket size={14} />
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
