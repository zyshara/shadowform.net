// Flatten Strapi rich-text blocks → plain string
function richTextToString(blocks = []) {
  return (blocks ?? [])
    .flatMap((b) => b.children ?? [])
    .map((c) => c.text ?? "")
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
