/**
 * Formats a number into a compact human-readable string with k/M suffixes.
 * Trailing `.0` is stripped for cleaner output.
 *
 * @param {number} n
 * @returns {string} e.g. 1500 → "1.5k", 2300000 → "2.3M", 42 → "42"
 */
export function formatCompactNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
}
