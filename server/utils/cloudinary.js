// Cloudinary image optimization helper.
//
// cdnImg(url, width) returns a Cloudinary-optimized URL:
//   - Cloudinary upload URLs: transforms injected into the existing path
//   - All other public URLs: wrapped with Cloudinary's fetch API
//
// Fetch requires the source domain to be allowed in your Cloudinary
// account settings (Security → Allowed fetch domains).
const CLOUD_NAME = "dfeyhbxeg";

export function cdnImg(url, width = 800) {
  if (!url) return url;

  const transforms = `f_auto,q_auto,w_${width}`;

  // Already a Cloudinary upload URL — inject transforms before the version/path
  const uploadMatch = url.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/
  );
  if (uploadMatch) return `${uploadMatch[1]}${transforms}/${uploadMatch[2]}`;

  // External URL — route through Cloudinary fetch
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transforms}/${encodeURI(url)}`;
}
