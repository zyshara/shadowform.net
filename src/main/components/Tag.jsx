// src/main/components/Tag.jsx

// src/main/components/Tag.jsx
// Import TagThemes.css in your index.css: @import "./TagThemes.css";

// ── Themed char renderer ───────────────────────────────────────────────────────
// Used for fire + rainbow — splits children into individual animated chars.
const ThemedTag = ({ children, theme, className, style }) => {
  const chars = String(children).split("");
  return (
    <span className={`${className} tag-theme--${theme}`} style={style}>
      {chars.map((char, i) => (
        <span
          key={i}
          className="tag-theme-char"
          style={{ "--char-i": i }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

// ── Tag ───────────────────────────────────────────────────────────────────────
const Tag = ({ children, variant = "lit", theme, onClick, href, target, rel }) => {
  const base = "text-[9px] tracking-[0.18em] uppercase px-[10px] py-[5px] rounded-[2px] border";

  const variants = {
    lit: {
      className: base,
      style: {
        color:       "var(--tag-lit-text)",
        borderColor: "var(--tag-lit-border)",
        background:  "var(--tag-lit-bg)",
      },
    },
    dim: {
      className: base,
      style: {
        color:       "var(--tag-dim-text)",
        borderColor: "var(--tag-dim-border)",
        background:  "var(--tag-dim-bg)",
      },
    },
    "lit-accent": {
      className: `font-alkhemikal ${base}`,
      style: {
        color:       "var(--tag-lit-text)",
        borderColor: "var(--tag-lit-border)",
        background:  "var(--tag-lit-bg)",
      },
    },
    "dim-accent": {
      className: `font-alkhemikal ${base}`,
      style: {
        color:       "var(--tag-dim-text)",
        borderColor: "var(--tag-dim-border)",
        background:  "var(--tag-dim-bg)",
      },
    },
    link: {
      className: `${base} transition-colors duration-150 font-alkhemikal`,
      style: {
        color:       "var(--text-footer)",
        borderColor: "var(--border)",
        background:  "transparent",
      },
    },
  };

  const { className, style } = variants[variant] ?? variants.lit;

  // ── themed variants (fire / rainbow) ────────────────────────────────────────
  if (theme === "fire-glitch" || theme === "rainbow-party") {
    if (onClick) {
      return (
        <button onClick={onClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <ThemedTag theme={theme} className={className} style={style}>{children}</ThemedTag>
        </button>
      );
    }
    if (href) {
      return (
        <a href={href} target={target} rel={rel} style={{ textDecoration: "none" }}>
          <ThemedTag theme={theme} className={className} style={style}>{children}</ThemedTag>
        </a>
      );
    }
    return <ThemedTag theme={theme} className={className} style={style}>{children}</ThemedTag>;
  }

  // ── link variant ─────────────────────────────────────────────────────────────
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={className}
        style={style}
        onMouseEnter={(e) => {
          e.currentTarget.style.color       = "var(--text-footer-accent)";
          e.currentTarget.style.borderColor = "var(--ornament-glyph)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color       = style.color;
          e.currentTarget.style.borderColor = style.borderColor;
        }}
      >
        {children}
      </a>
    );
  }

  // ── button (selectable) ───────────────────────────────────────────────────────
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${className} transition-colors duration-100`}
        style={{ ...style, cursor: "pointer" }}
      >
        {children}
      </button>
    );
  }

  // ── default span ──────────────────────────────────────────────────────────────
  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
};

export default Tag;
