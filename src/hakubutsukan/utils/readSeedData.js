export function readSeedData(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return null;
  try {
    return JSON.parse(el.textContent);
  } catch {
    return null;
  }
}
