import appsConfig from "../../../config/apps.json";
const { metadata } = appsConfig.domeofdoom;

export const pageMeta = (label) => ({ data, location }) => {
  const name = data?.pageTitle ?? label;
  const title = name ? `${name} — ${metadata.title}` : metadata.title;
  const url = new URL(location.pathname, metadata.url).href;
  const image = data?.image ?? metadata.image;
  return [
    { title }, { name: "description", content: metadata.description },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: metadata.title },
    { property: "og:title", content: title },
    { property: "og:description", content: metadata.description },
    { property: "og:url", content: url }, { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: metadata.description },
    { name: "twitter:image", content: image },
    { tagName: "link", rel: "canonical", href: url },
    ...(metadata.jsonLd ? [{ "script:ld+json": metadata.jsonLd }] : []),
  ];
};
