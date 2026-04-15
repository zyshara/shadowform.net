// Flatten Strapi rich-text blocks → plain string
export function richTextToString(blocks = []) {
  return (blocks ?? [])
    .flatMap((b) => b.children ?? [])
    .map((c) => c.text ?? "")
    .join("");
}

// Convert JSX-style inline props → valid HTML attributes
// e.g.  style={{ color: "red" }}  →  style="color: red"
function jsxAttrsToHtml(text) {
  return text.replace(
    /style=\{\{\s*([\w]+):\s*"([^"]+)"\s*\}\}/g,
    (_, prop, val) => {
      const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `style="${cssProp}: ${val}"`;
    },
  );
}

// Flatten Strapi rich-text blocks → HTML string (one <p> per block)
export function richTextToHtml(blocks = []) {
  return (blocks ?? [])
    .map((block) => {
      const text = (block.children ?? []).map((c) => c.text ?? "").join("");
      return `<p>${jsxAttrsToHtml(text)}</p>`;
    })
    .join("");
}

export function normalizeHeader(raw) {
  if (!raw) return null;

  return {
    eyebrow:     raw.eyebrow     ?? "",
    heading:     raw.heading     ?? "",
    description: Array.isArray(raw.description)
      ? richTextToString(raw.description)
      : (raw.description ?? ""),
  };
}
