// src/jenis32/tokens.js
// Re-exports the CSS custom properties from index.css as var() references,
// so components reading `colors.accent` etc. track live edits to those
// properties instead of a value frozen at import time.

export const colors = {
  bg: "var(--j32-bg)",
  card: "var(--j32-card)",
  border: "var(--j32-border)",
  text: "var(--j32-text)",
  heading: "var(--j32-heading)",
  accent: "var(--j32-accent)",
  accentText: "var(--j32-accent-text)",
  success: "var(--j32-success)",
};
