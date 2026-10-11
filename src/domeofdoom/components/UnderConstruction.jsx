import React from "react";

const UnderConstruction = () => (
  <div className="mx-auto max-w-[1400px] px-10 py-[120px] flex flex-col items-center justify-center gap-4 text-center">
    <div style={{ fontSize: 48 }}>🚧</div>
    <div
      style={{
        fontFamily: "'Archivo', sans-serif",
        fontStretch: "125%",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--dod-lilac)",
      }}
    >
      Under Construction
    </div>
  </div>
);

export default UnderConstruction;
