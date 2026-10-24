// Cloudinary image optimization helper.
//
// cdnImg(url, width) returns a Cloudinary-optimized URL:
//   - Cloudinary upload URLs: transforms injected into the existing path
//   - All other URLs: preserved until fetch domains are configured
//
// c_limit prevents upscaling small originals; f_webp delivers WebP consistently.
// Fetch requires the source domain to be allowed in your Cloudinary
// account settings (Security → Allowed fetch domains).

export function cdnImg(url, width = 800) {
  if (!url) return url;

  const transforms = `f_webp,q_auto,c_limit,w_${width}`;

  // Already a Cloudinary upload URL — inject transforms before the version/path
  const uploadMatch = url.match(
    /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/
  );
  if (uploadMatch) {
    const asset = uploadMatch[2].replace(/\.(png|jpe?g|webp|avif|tiff?|gif)(?=$|[?#])/i, ".webp");
    return `${uploadMatch[1]}${transforms}/${asset}`;
  }

  // External URL — return as-is until Cloudinary fetch domains are configured
  // (Cloudinary Console → Settings → Security → Allowed fetch domains)
  return url;
}
