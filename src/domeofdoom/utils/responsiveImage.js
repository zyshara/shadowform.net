// Existing Cloudinary upload URLs can provide smaller/larger display variants.
// Other image hosts retain their original URL until they support our resizing.
export function responsiveImage(src, sizes, widths = [200, 400, 800]) {
  if (!src) return { src };
  let url;
  try { url = new URL(src); } catch { return { src }; }
  if (url.hostname !== "res.cloudinary.com" || !url.pathname.includes("/image/upload/")) return { src };
  const [prefix, asset] = url.pathname.split("/image/upload/");
  const candidates = widths.map(width => {
    const parts = asset.split("/");
    let foundWidth = false;
    for (let i = 0; i < parts.length && /^[a-z]+_/.test(parts[i]); i++) {
      parts[i] = parts[i].split(",").map(token => {
        if (/^w_\d+$/.test(token)) { foundWidth = true; return `w_${width}`; }
        return token;
      }).join(",");
    }
    if (!foundWidth) parts.unshift(`f_webp,q_auto,c_limit,w_${width}`);
    const candidate = new URL(url);
    candidate.pathname = `${prefix}/image/upload/${parts.join("/")}`;
    return `${candidate.href} ${width}w`;
  });
  return { src, srcSet: candidates.join(", "), sizes };
}
