// src/main/components/Ornament.jsx

const Ornament = ({ variant = "diamond", className = "" }) => {
  const divider = "✦·✦·✦";

  if (variant === "dot") divider = "•• ━━━━━ ••●•• ━━━━━ ••";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="h-px w-14"
        style={{
          background: `linear-gradient(to left, var(--ornament-line), transparent)`,
        }}
      />
      <span
        className="font-alkhemikal text-[10px] tracking-[0.2em]"
        style={{ color: "var(--ornament-glyph)" }}
      >
        {divider}
      </span>
      <div
        className="h-px w-14"
        style={{
          background: `linear-gradient(to right, var(--ornament-line), transparent)`,
        }}
      />
    </div>
  );
};

export default Ornament;
