import React from "react";

export default function DODBadge({ color = "var(--dod-neon-mint)", size = 72 }) {
  const globeSize = Math.round(size * 0.55);
  const fontSize = Math.round(size * 0.14);

  return (
    <div
      style={{
        width: size,
        height: size,
        border: `1px solid ${color}`,
        background: "var(--dod-black)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: Math.round(size * 0.06),
        color,
      }}
    >
      {/* Wireframe globe */}
      <svg
        viewBox="-52 -52 104 104"
        width={globeSize}
        height={globeSize}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        style={{ display: "block", overflow: "visible" }}
        aria-hidden="true"
      >
        <g strokeLinecap="round">
          <circle cx="0" cy="0" r="45" />
          {[6, 20, 33].map((rx) => (
            <ellipse key={rx} cx="0" cy="0" rx={rx} ry="45" />
          ))}
          {[
            [0,   45,   10],
            [-14, 42.8, 9.4],
            [14,  42.8, 9.4],
            [-28, 35.2, 7.7],
            [28,  35.2, 7.7],
            [-39, 22.4, 4.9],
            [39,  22.4, 4.9],
          ].map(([cy, rx, ry]) => (
            <ellipse key={cy} cx="0" cy={cy} rx={rx} ry={ry} />
          ))}
        </g>
      </svg>

      <span
        style={{
          fontFamily: "'Archivo', system-ui, sans-serif",
          fontStretch: "125%",
          fontWeight: 700,
          fontSize,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          lineHeight: 1,
          color,
        }}
      >
        DOD
      </span>
    </div>
  );
}
